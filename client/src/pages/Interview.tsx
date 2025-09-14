import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/Sidebar";
import ChatInterface from "@/components/ChatInterface";
import ProgressPanel from "@/components/ProgressPanel";
import ResultsModal from "@/components/ResultsModal";
import type { SessionDetails } from "@/types/interview";

export default function Interview() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/interview/:sessionId");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [sessionId, setSessionId] = useState<string | null>(params?.sessionId || null);
  const [showResults, setShowResults] = useState(false);

  // Start new interview mutation
  const startInterviewMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/interviews/start");
      return response.json();
    },
    onSuccess: (data) => {
      setSessionId(data.id);
      navigate(`/interview/${data.id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/interviews", data.id] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to start interview. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Fetch interview session data
  const { data: sessionData, isLoading: sessionLoading } = useQuery<SessionDetails>({
    queryKey: ["/api/interviews", sessionId],
    enabled: !!sessionId,
    refetchInterval: 5000, // Refresh every 5 seconds to get updates
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ message }: { message: string }) => {
      const response = await apiRequest("POST", `/api/interviews/${sessionId}/message`, { message });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interviews", sessionId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Upload file mutation
  const uploadFileMutation = useMutation({
    mutationFn: async ({ file, message }: { file: File; message?: string }) => {
      const formData = new FormData();
      formData.append('excel', file);
      if (message) {
        formData.append('message', message);
      }

      const response = await fetch(`/api/interviews/${sessionId}/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interviews", sessionId] });
      toast({
        title: "Success",
        description: "File uploaded successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Download template function
  const downloadTemplate = async (templateType: string) => {
    try {
      const response = await fetch(`/api/interviews/${sessionId}/template/${templateType}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to download template');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${templateType}_template.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Template downloaded successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download template. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = (message: string) => {
    sendMessageMutation.mutate({ message });
  };

  const handleFileUpload = (file: File, message?: string) => {
    uploadFileMutation.mutate({ file, message });
  };

  const handleStartInterview = () => {
    startInterviewMutation.mutate();
  };

  // Check if interview is completed
  useEffect(() => {
    if (sessionData?.session?.status === 'completed' && !showResults) {
      setShowResults(true);
    }
  }, [sessionData?.session?.status, showResults]);

  if (!sessionId && !startInterviewMutation.isPending) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="lg:pl-64 flex flex-col flex-1">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">Ready to start your Excel assessment?</h2>
              <p className="text-muted-foreground mb-8">
                This comprehensive interview will evaluate your Excel skills across multiple categories.
              </p>
              <button
                onClick={handleStartInterview}
                disabled={startInterviewMutation.isPending}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                data-testid="button-start-interview"
              >
                {startInterviewMutation.isPending ? (
                  <span className="flex items-center">
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Starting Interview...
                  </span>
                ) : (
                  "Start Interview"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (sessionLoading || !sessionData) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="lg:pl-64 flex flex-col flex-1">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <i className="fas fa-spinner fa-spin text-3xl text-primary mb-4"></i>
              <p className="text-muted-foreground">Loading interview...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { session, messages, questions, progress } = sessionData as SessionDetails;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Excel Skills Assessment</h1>
            <p className="text-sm text-muted-foreground">Interactive AI-powered technical interview</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Progress Indicator */}
            <div className="flex items-center space-x-3 bg-muted px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm font-medium" data-testid="text-progress">
                  Question {progress.currentQuestion} of {progress.totalQuestions}
                </span>
              </div>
              <div className="w-24 bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${progress.percentage}%` }}
                ></div>
              </div>
            </div>
            
            {/* Timer */}
            <div className="flex items-center space-x-2 text-sm">
              <i className="fas fa-clock text-muted-foreground"></i>
              <span className="font-mono" data-testid="text-timer">
                {session.status === 'completed' ? 'Completed' : 'In Progress'}
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full flex">
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              onFileUpload={handleFileUpload}
              onDownloadTemplate={downloadTemplate}
              isLoading={sendMessageMutation.isPending || uploadFileMutation.isPending}
              isCompleted={session.status === 'completed'}
            />
            
            <ProgressPanel
              session={session}
              questions={questions}
              progress={progress}
            />
          </div>
        </main>
      </div>

      {/* Results Modal */}
      {showResults && (
        <ResultsModal
          session={session}
          onClose={() => setShowResults(false)}
        />
      )}

      {/* Mobile Menu Button */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-card border border-border shadow-sm"
        data-testid="button-mobile-menu"
      >
        <i className="fas fa-bars"></i>
      </button>
    </div>
  );
}
