/*
 * App.jsx - Main Application Component with Session Protection System
 *
 * SESSION PROTECTION SYSTEM OVERVIEW:
 * ===================================
 *
 * Problem: Automatic project updates from WebSocket would refresh the sidebar and clear chat messages
 * during active conversations, creating a poor user experience.
 *
 * Solution: Track "active sessions" and pause project updates during conversations.
 *
 * How it works:
 * 1. When user sends message → session marked as "active"
 * 2. Project updates are skipped while session is active
 * 3. When conversation completes/aborts → session marked as "inactive"
 * 4. Project updates resume normally
 *
 * Handles both existing sessions (with real IDs) and new sessions (with temporary IDs).
 */

import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useLogger } from "@kit/logger/react";
import type { Logger } from "@kit/logger/types";
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";
import { MobileNav } from "./components/MobileNav";
import type { MobileNavTab } from "./components/MobileNav";
import ToolsSettings from "./components/ToolsSettings";
import { QuickSettingsPanel } from "./components/QuickSettingsPanel";
import { useWebSocket } from "./utils/websocket";
import type { WSMessage } from "./utils/websocket";
import { ThemeProvider } from "./contexts/ThemeContext";

// Extend Window interface for refreshProjects function
declare global {
  interface Window {
    refreshProjects?: () => void;
  }
}

// Project and Session type definitions
export interface Project {
  id: string;
  name: string;
  displayName: string;
  fullPath: string;
  sessionMeta: SessionMeta;
  sessions: Session[];
}

export interface Session {
  id: string;
  summary: string;
  title?: string;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
  messageCount?: number;
  lastActivity?: string;
}

export interface SessionMeta {
  totalSessions: number;
  total?: number;
  recentSession?: Session;
  hasMore?: boolean;
}

// Main App component with routing
function AppContent() {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const logger: Logger = useLogger({ component: "App" });

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState<MobileNavTab>("chat");
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState<boolean>(true);
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  const [showToolsSettings, setShowToolsSettings] = useState<boolean>(false);
  const [showQuickSettings, setShowQuickSettings] = useState<boolean>(false);
  const [autoExpandTools, setAutoExpandTools] = useState<boolean>(() => {
    const saved = localStorage.getItem("autoExpandTools");
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [showRawParameters, setShowRawParameters] = useState<boolean>(() => {
    const saved = localStorage.getItem("showRawParameters");
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [autoScrollToBottom, setAutoScrollToBottom] = useState<boolean>(() => {
    const saved = localStorage.getItem("autoScrollToBottom");
    return saved !== null ? JSON.parse(saved) : true;
  });
  // Session Protection System: Track sessions with active conversations to prevent
  // automatic project updates from interrupting ongoing chats. When a user sends
  // a message, the session is marked as "active" and project updates are paused
  // until the conversation completes or is aborted.
  const [activeSessions, setActiveSessions] = useState<Set<string>>(new Set());

  const { ws, sendMessage, messages } = useWebSocket();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    // Fetch projects on component mount
    void fetchProjects();
  }, []);

  // Helper function to determine if an update is purely additive (new sessions/projects)
  // vs modifying existing selected items that would interfere with active conversations
  const isUpdateAdditive = (
    currentProjects: Project[],
    updatedProjects: Project[],
    selectedProject: Project | null,
    selectedSession: Session | null,
  ): boolean => {
    if (!selectedProject || !selectedSession) {
      // No active session to protect, allow all updates
      return true;
    }

    // Find the selected project in both current and updated data
    const currentSelectedProject = currentProjects?.find(
      (p: Project) => p.name === selectedProject.name,
    );
    const updatedSelectedProject = updatedProjects?.find(
      (p: Project) => p.name === selectedProject.name,
    );

    if (!currentSelectedProject || !updatedSelectedProject) {
      // Project structure changed significantly, not purely additive
      return false;
    }

    // Find the selected session in both current and updated project data
    const currentSelectedSession = currentSelectedProject.sessions?.find(
      (s: Session) => s.id === selectedSession.id,
    );
    const updatedSelectedSession = updatedSelectedProject.sessions?.find(
      (s: Session) => s.id === selectedSession.id,
    );

    if (!currentSelectedSession || !updatedSelectedSession) {
      // Selected session was deleted or significantly changed, not purely additive
      return false;
    }

    // Check if the selected session's content has changed (modification vs addition)
    // Compare key fields that would affect the loaded chat interface
    const sessionUnchanged =
      currentSelectedSession.id === updatedSelectedSession.id &&
      currentSelectedSession.title === updatedSelectedSession.title &&
      currentSelectedSession.created_at === updatedSelectedSession.created_at &&
      currentSelectedSession.updated_at === updatedSelectedSession.updated_at;

    // This is considered additive if the selected session is unchanged
    // (new sessions may have been added elsewhere, but active session is protected)
    return sessionUnchanged;
  };

  // Handle WebSocket messages for real-time project updates
  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage: WSMessage = messages[messages.length - 1]!;

      if (latestMessage.type === "projects_updated") {
        // Session Protection Logic: Allow additions but prevent changes during active conversations
        // This allows new sessions/projects to appear in sidebar while protecting active chat messages
        // We check for two types of active sessions:
        // 1. Existing sessions: selectedSession.id exists in activeSessions
        // 2. New sessions: temporary "new-session-*" identifiers in activeSessions (before real session ID is received)
        const hasActiveSession =
          (selectedSession && activeSessions.has(selectedSession.id)) ??
          (activeSessions.size > 0 &&
            Array.from(activeSessions).some((id) =>
              id.startsWith("new-session-"),
            ));

        if (hasActiveSession) {
          // Allow updates but be selective: permit additions, prevent changes to existing items
          const updatedProjects = latestMessage.projects;
          const currentProjects = projects;

          // Check if this is purely additive (new sessions/projects) vs modification of existing ones
          const isAdditiveUpdate = isUpdateAdditive(
            currentProjects,
            updatedProjects,
            selectedProject,
            selectedSession,
          );

          if (!isAdditiveUpdate) {
            // Skip updates that would modify existing selected session/project
            return;
          }
          // Continue with additive updates below
        }

        // Update projects state with the new data from WebSocket
        const updatedProjects: Project[] =
          latestMessage.data?.projects ?? latestMessage.projects ?? [];
        setProjects(updatedProjects);

        // Update selected project if it exists in the updated projects
        if (selectedProject) {
          const updatedSelectedProject = updatedProjects.find(
            (p: Project) => p.name === selectedProject.name,
          );
          if (updatedSelectedProject) {
            setSelectedProject(updatedSelectedProject);

            // Update selected session only if it was deleted - avoid unnecessary reloads
            if (selectedSession) {
              const updatedSelectedSession =
                updatedSelectedProject.sessions?.find(
                  (s: Session) => s.id === selectedSession.id,
                );
              if (!updatedSelectedSession) {
                // Session was deleted
                setSelectedSession(null);
              }
              // Don't update if session still exists with same ID - prevents reload
            }
          }
        }
      }

      // Handle session summary updates
      if (latestMessage.type === "session-summary-updated") {
        if (logger.isLevelEnabled("debug")) {
          logger.debug("Session summary updated", {
            sessionId: latestMessage.sessionId,
            summary: latestMessage.summary,
          });
        }

        // Update the session summary in the projects state
        setProjects((prevProjects: Project[]) => {
          return prevProjects.map((project: Project) => {
            // Find the project containing this session
            const hasSession = project.sessions?.some(
              (s: Session) => s.id === latestMessage.sessionId,
            );
            if (hasSession) {
              return {
                ...project,
                sessions: project.sessions.map((session: Session) => {
                  if (session.id === latestMessage.sessionId) {
                    return {
                      ...session,
                      summary: latestMessage.summary,
                    };
                  }
                  return session;
                }),
              };
            }
            return project;
          });
        });

        // Update selected session if it matches
        if (selectedSession?.id === latestMessage.sessionId) {
          setSelectedSession((prev: Session | null) =>
            prev
              ? {
                  ...prev,
                  summary: latestMessage.summary,
                }
              : null,
          );
        }
      }
    }
  }, [messages, selectedProject, selectedSession, activeSessions]);

  const fetchProjects = async (): Promise<void> => {
    try {
      setIsLoadingProjects(true);
      const response = await fetch("/api/projects");
      const data: Project[] = await response.json();

      // Optimize to preserve object references when data hasn't changed
      setProjects((prevProjects: Project[]) => {
        // If no previous projects, just set the new data
        if (prevProjects.length === 0) {
          return data;
        }

        // Check if the projects data has actually changed
        const hasChanges =
          data.some((newProject: Project, index: number) => {
            const prevProject = prevProjects[index];
            if (!prevProject) return true;

            // Compare key properties that would affect UI
            return (
              newProject.name !== prevProject.name ||
              newProject.displayName !== prevProject.displayName ||
              newProject.fullPath !== prevProject.fullPath ||
              JSON.stringify(newProject.sessionMeta) !==
                JSON.stringify(prevProject.sessionMeta) ||
              JSON.stringify(newProject.sessions) !==
                JSON.stringify(prevProject.sessions)
            );
          }) || data.length !== prevProjects.length;

        // Only update if there are actual changes
        return hasChanges ? data : prevProjects;
      });

      // Don't auto-select any project - user should choose manually
    } catch (error) {
      logger.error("Error fetching projects", { error });
    } finally {
      setIsLoadingProjects(false);
    }
  };

  // Expose fetchProjects globally for component access
  window.refreshProjects = fetchProjects;

  // Handle URL-based session loading
  useEffect(() => {
    if (sessionId && projects.length > 0) {
      // Only switch tabs on initial load, not on every project update
      const shouldSwitchTab =
        !selectedSession || selectedSession.id !== sessionId;

      // Find the session across all projects
      for (const project of projects) {
        const session = project.sessions?.find((s) => s.id === sessionId);
        if (session) {
          setSelectedProject(project);
          setSelectedSession(session);
          // Only switch to chat tab if we're loading a different session
          if (shouldSwitchTab) {
            setActiveTab("chat");
          }
          return;
        }
      }

      // If session not found, it might be a newly created session
      // Just navigate to it and it will be found when the sidebar refreshes
      // Don't redirect to home, let the session load naturally
    }
  }, [sessionId, projects, navigate]);

  const handleProjectSelect = (project: Project): void => {
    setSelectedProject(project);
    setSelectedSession(null);
    navigate("/");
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleSessionSelect = (session: Session): void => {
    setSelectedSession(session);
    // Only switch to chat tab when user explicitly selects a session
    // This prevents tab switching during automatic updates
    if (activeTab !== "git" && activeTab !== "preview") {
      setActiveTab("chat");
    }
    if (isMobile) {
      setSidebarOpen(false);
    }
    navigate(`/session/${session.id}`);
  };

  const handleNewSession = (project: Project): void => {
    setSelectedProject(project);
    setSelectedSession(null);
    setActiveTab("chat");
    navigate("/");
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleSessionDelete = (sessionId: string): void => {
    // If the deleted session was currently selected, clear it
    if (selectedSession?.id === sessionId) {
      setSelectedSession(null);
      navigate("/");
    }

    // Update projects state locally instead of full refresh
    setProjects((prevProjects: Project[]) =>
      prevProjects.map((project: Project) => ({
        ...project,
        sessions:
          project.sessions?.filter(
            (session: Session) => session.id !== sessionId,
          ) ?? [],
        sessionMeta: {
          ...project.sessionMeta,
          total: Math.max(0, (project.sessionMeta?.total ?? 0) - 1),
        },
      })),
    );
  };

  const handleSidebarRefresh = async (): Promise<void> => {
    // Refresh only the sessions for all projects, don't change selected state
    try {
      const response = await fetch("/api/projects");
      const freshProjects: Project[] = await response.json();

      // Optimize to preserve object references and minimize re-renders
      setProjects((prevProjects) => {
        // Check if projects data has actually changed
        const hasChanges =
          freshProjects.some((newProject, index) => {
            const prevProject = prevProjects[index];
            if (!prevProject) return true;

            return (
              newProject.name !== prevProject.name ||
              newProject.displayName !== prevProject.displayName ||
              newProject.fullPath !== prevProject.fullPath ||
              JSON.stringify(newProject.sessionMeta) !==
                JSON.stringify(prevProject.sessionMeta) ||
              JSON.stringify(newProject.sessions) !==
                JSON.stringify(prevProject.sessions)
            );
          }) || freshProjects.length !== prevProjects.length;

        return hasChanges ? freshProjects : prevProjects;
      });

      // If we have a selected project, make sure it's still selected after refresh
      if (selectedProject) {
        const refreshedProject = freshProjects.find(
          (p) => p.name === selectedProject.name,
        );
        if (refreshedProject) {
          // Only update selected project if it actually changed
          if (
            JSON.stringify(refreshedProject) !== JSON.stringify(selectedProject)
          ) {
            setSelectedProject(refreshedProject);
          }

          // If we have a selected session, try to find it in the refreshed project
          if (selectedSession) {
            const refreshedSession = refreshedProject.sessions?.find(
              (s) => s.id === selectedSession.id,
            );
            if (
              refreshedSession &&
              JSON.stringify(refreshedSession) !==
                JSON.stringify(selectedSession)
            ) {
              setSelectedSession(refreshedSession);
            }
          }
        }
      }
    } catch (error) {
      logger.error("Error refreshing sidebar", { error });
    }
  };

  const handleProjectDelete = (projectName: string): void => {
    // If the deleted project was currently selected, clear it
    if (selectedProject?.name === projectName) {
      setSelectedProject(null);
      setSelectedSession(null);
      navigate("/");
    }

    // Update projects state locally instead of full refresh
    setProjects((prevProjects: Project[]) =>
      prevProjects.filter((project: Project) => project.name !== projectName),
    );
  };

  // Session Protection Functions: Manage the lifecycle of active sessions

  // markSessionAsActive: Called when user sends a message to mark session as protected
  // This includes both real session IDs and temporary "new-session-*" identifiers
  const markSessionAsActive = (sessionId: string): void => {
    if (sessionId) {
      setActiveSessions((prev: Set<string>) => new Set([...prev, sessionId]));
    }
  };

  // markSessionAsInactive: Called when conversation completes/aborts to re-enable project updates
  const markSessionAsInactive = (sessionId: string): void => {
    if (sessionId) {
      setActiveSessions((prev: Set<string>) => {
        const newSet = new Set(prev);
        newSet.delete(sessionId);
        return newSet;
      });
    }
  };

  // replaceTemporarySession: Called when WebSocket provides real session ID for new sessions
  // Removes temporary "new-session-*" identifiers and adds the real session ID
  // This maintains protection continuity during the transition from temporary to real session
  const replaceTemporarySession = (realSessionId: string): void => {
    if (realSessionId) {
      setActiveSessions((prev: Set<string>) => {
        const newSet = new Set<string>();
        // Keep all non-temporary sessions and add the real session ID
        for (const sessionId of prev) {
          if (!sessionId.startsWith("new-session-")) {
            newSet.add(sessionId);
          }
        }
        newSet.add(realSessionId);
        return newSet;
      });
    }
  };

  return (
    <div className="fixed inset-0 flex bg-background">
      {/* Fixed Desktop Sidebar */}
      {!isMobile && (
        <div className="w-80 flex-shrink-0 border-r border-border bg-card">
          <div className="h-full overflow-hidden">
            <Sidebar
              projects={projects}
              selectedProject={selectedProject}
              selectedSession={selectedSession}
              onProjectSelect={handleProjectSelect}
              onSessionSelect={handleSessionSelect}
              onNewSession={handleNewSession}
              onSessionDelete={handleSessionDelete}
              onProjectDelete={handleProjectDelete}
              isLoading={isLoadingProjects}
              onRefresh={handleSidebarRefresh}
              onShowSettings={() => void setShowToolsSettings(true)}
            />
          </div>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isMobile && (
        <div
          className={`fixed inset-0 z-50 flex transition-all duration-150 ease-out ${
            sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        >
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-150 ease-out"
            onClick={(e) => {
              e.stopPropagation();
              setSidebarOpen(false);
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSidebarOpen(false);
            }}
          />
          <div
            className={`relative w-[85vw] max-w-sm sm:w-80 bg-card border-r border-border h-full transform transition-transform duration-150 ease-out ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <Sidebar
              projects={projects}
              selectedProject={selectedProject}
              selectedSession={selectedSession}
              onProjectSelect={handleProjectSelect}
              onSessionSelect={handleSessionSelect}
              onNewSession={handleNewSession}
              onSessionDelete={handleSessionDelete}
              onProjectDelete={handleProjectDelete}
              isLoading={isLoadingProjects}
              onRefresh={handleSidebarRefresh}
              onShowSettings={() => void setShowToolsSettings(true)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area - Flexible */}
      <div className="flex-1 flex flex-col min-w-0">
        <MainContent
          selectedProject={selectedProject}
          selectedSession={selectedSession}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          ws={ws}
          sendMessage={sendMessage}
          messages={messages}
          isMobile={isMobile}
          onMenuClick={() => setSidebarOpen(true)}
          isLoading={isLoadingProjects}
          onInputFocusChange={setIsInputFocused}
          onSessionActive={markSessionAsActive}
          onSessionInactive={markSessionAsInactive}
          onReplaceTemporarySession={replaceTemporarySession}
          onNavigateToSession={(sessionId: string) =>
            navigate(`/session/${sessionId}`)
          }
          onShowSettings={() => setShowToolsSettings(true)}
          autoExpandTools={autoExpandTools}
          showRawParameters={showRawParameters}
          autoScrollToBottom={autoScrollToBottom}
        />
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <MobileNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isInputFocused={isInputFocused}
        />
      )}

      {/* Quick Settings Panel - Only show on chat tab */}
      {activeTab === "chat" && (
        <QuickSettingsPanel
          isOpen={showQuickSettings}
          onToggle={setShowQuickSettings}
          autoExpandTools={autoExpandTools}
          onAutoExpandChange={(value) => {
            setAutoExpandTools(value);
            void localStorage.setItem("autoExpandTools", JSON.stringify(value));
          }}
          showRawParameters={showRawParameters}
          onShowRawParametersChange={(value) => {
            setShowRawParameters(value);
            void localStorage.setItem("showRawParameters", JSON.stringify(value));
          }}
          autoScrollToBottom={autoScrollToBottom}
          onAutoScrollChange={(value) => {
            setAutoScrollToBottom(value);
            void localStorage.setItem("autoScrollToBottom", JSON.stringify(value));
          }}
          isMobile={isMobile}
        />
      )}

      {/* Tools Settings Modal */}
      <ToolsSettings
        isOpen={showToolsSettings}
        onClose={() => void setShowToolsSettings(false)}
      />
    </div>
  );
}

// Root App component with router
function App() {
  return (
    <ThemeProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<AppContent />} />
          <Route path="/session/:sessionId" element={<AppContent />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
