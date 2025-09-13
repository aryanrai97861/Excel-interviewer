import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/Sidebar";
import type { InterviewSession } from "@/types/interview";

export default function History() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: sessions, isLoading: sessionsLoading, error } = useQuery<InterviewSession[]>({
    queryKey: ["/api/interviews/history"],
    enabled: isAuthenticated,
  });

  if (error && isUnauthorizedError(error)) {
    return null; // Will redirect above
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'in_progress':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'abandoned':
        return <Badge variant="destructive">Abandoned</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-muted-foreground';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold">Interview History</h1>
            <p className="text-sm text-muted-foreground">View your past Excel skill assessments</p>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {sessionsLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <i className="fas fa-spinner fa-spin text-3xl text-primary mb-4"></i>
                <p className="text-muted-foreground">Loading interview history...</p>
              </div>
            </div>
          ) : !sessions || sessions.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-history text-muted-foreground text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold mb-2">No interviews yet</h3>
                <p className="text-muted-foreground mb-4">Start your first Excel skills assessment to see results here.</p>
                <Button onClick={() => window.location.href = '/'} data-testid="button-start-first">
                  Start Your First Interview
                </Button>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {sessions.map((session: InterviewSession) => (
                <Card key={session.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center space-x-3">
                          <span>Excel Skills Assessment</span>
                          {getStatusBadge(session.status)}
                        </CardTitle>
                        <CardDescription>
                          Started: {formatDate(session.startedAt)}
                          {session.completedAt && (
                            <span> • Completed: {formatDate(session.completedAt)}</span>
                          )}
                        </CardDescription>
                      </div>
                      {session.status === 'completed' && session.overallScore && (
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getScoreColor(session.overallScore)}`}>
                            {session.overallScore}%
                          </div>
                          <div className="text-sm text-muted-foreground">Overall Score</div>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {session.status === 'completed' ? (
                      <div className="space-y-4">
                        {/* Score Breakdown */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <div className={`text-lg font-semibold ${getScoreColor(session.practicalScore)}`}>
                              {session.practicalScore || 0}%
                            </div>
                            <div className="text-sm text-muted-foreground">Practical</div>
                          </div>
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <div className={`text-lg font-semibold ${getScoreColor(session.conceptualScore)}`}>
                              {session.conceptualScore || 0}%
                            </div>
                            <div className="text-sm text-muted-foreground">Conceptual</div>
                          </div>
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <div className={`text-lg font-semibold ${getScoreColor(session.explanationScore)}`}>
                              {session.explanationScore || 0}%
                            </div>
                            <div className="text-sm text-muted-foreground">Explanations</div>
                          </div>
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <div className={`text-lg font-semibold ${getScoreColor(session.behavioralScore)}`}>
                              {session.behavioralScore || 0}%
                            </div>
                            <div className="text-sm text-muted-foreground">Behavioral</div>
                          </div>
                        </div>

                        {/* Strengths and Improvements */}
                        {(session.strengths?.length || session.improvements?.length) && (
                          <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                            {session.strengths && session.strengths.length > 0 && (
                              <div>
                                <h4 className="font-semibold mb-2 text-green-700">Strengths</h4>
                                <ul className="space-y-1 text-sm">
                                  {session.strengths.slice(0, 3).map((strength, index) => (
                                    <li key={index} className="flex items-start space-x-2">
                                      <i className="fas fa-check-circle text-green-500 mt-0.5 text-xs"></i>
                                      <span>{strength}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {session.improvements && session.improvements.length > 0 && (
                              <div>
                                <h4 className="font-semibold mb-2 text-amber-700">Areas for Improvement</h4>
                                <ul className="space-y-1 text-sm">
                                  {session.improvements.slice(0, 3).map((improvement, index) => (
                                    <li key={index} className="flex items-start space-x-2">
                                      <i className="fas fa-exclamation-triangle text-amber-500 mt-0.5 text-xs"></i>
                                      <span>{improvement}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex space-x-2 pt-4 border-t">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.location.href = `/interview/${session.id}`}
                            data-testid={`button-view-${session.id}`}
                          >
                            <i className="fas fa-eye mr-2"></i>
                            View Details
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            data-testid={`button-download-${session.id}`}
                          >
                            <i className="fas fa-download mr-2"></i>
                            Download Report
                          </Button>
                        </div>
                      </div>
                    ) : session.status === 'in_progress' ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Progress: {session.currentQuestionIndex + 1} of {session.totalQuestions} questions
                          </p>
                          <div className="w-48 bg-secondary rounded-full h-2 mt-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${((session.currentQuestionIndex + 1) / session.totalQuestions) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <Button 
                          onClick={() => window.location.href = `/interview/${session.id}`}
                          data-testid={`button-continue-${session.id}`}
                        >
                          Continue Interview
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">This interview was not completed.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
