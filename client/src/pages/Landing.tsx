import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/20"></div>
        <div className="relative">
          <header className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-table-cells text-primary-foreground text-sm"></i>
              </div>
              <span className="text-lg font-semibold">ExcelAI Interviewer</span>
            </div>
            <Button onClick={handleLogin} size="sm">
              Get Started
            </Button>
          </header>

          <div className="max-w-6xl mx-auto px-6 py-20">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                AI-Powered Assessment
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Professional Excel Skills Assessment
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                Comprehensive AI-driven mock interviews that evaluate your Excel expertise through practical tasks, 
                conceptual questions, and real-world scenarios.
              </p>
              <Button onClick={handleLogin} size="lg" className="mr-4" data-testid="button-start-assessment">
                Start Assessment
              </Button>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <i className="fas fa-comments text-green-600 text-xl"></i>
                  </div>
                  <CardTitle>Interactive Interview</CardTitle>
                  <CardDescription>
                    Multi-turn conversations with AI that adapts to your responses and provides real-time feedback.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <i className="fas fa-file-excel text-blue-600 text-xl"></i>
                  </div>
                  <CardTitle>Practical Excel Tasks</CardTitle>
                  <CardDescription>
                    Real Excel files to work with, including data analysis, formula creation, and dashboard building.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <i className="fas fa-chart-line text-purple-600 text-xl"></i>
                  </div>
                  <CardTitle>Detailed Scoring</CardTitle>
                  <CardDescription>
                    Comprehensive evaluation with scores across practical skills, conceptual knowledge, and best practices.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Assessment Overview */}
      <div className="bg-card py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What You'll Be Assessed On</h2>
            <p className="text-lg text-muted-foreground">
              Our comprehensive evaluation covers all aspects of Excel proficiency
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">50%</span>
              </div>
              <h3 className="font-semibold mb-2">Practical Tasks</h3>
              <p className="text-sm text-muted-foreground">
                Real Excel work including data analysis, formula creation, and dashboard building
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">25%</span>
              </div>
              <h3 className="font-semibold mb-2">Conceptual Knowledge</h3>
              <p className="text-sm text-muted-foreground">
                Understanding of Excel functions, formulas, and best practices
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">15%</span>
              </div>
              <h3 className="font-semibold mb-2">Explanations</h3>
              <p className="text-sm text-muted-foreground">
                Ability to explain your approach and reasoning clearly
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">10%</span>
              </div>
              <h3 className="font-semibold mb-2">Behavioral</h3>
              <p className="text-sm text-muted-foreground">
                Problem-solving approach and professional experience
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Covered */}
      <div className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Skills & Topics Covered</h2>
            <p className="text-lg text-muted-foreground">
              From basic functions to advanced analytics
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Foundation Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    Cell references & basic functions
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    Absolute vs relative references
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    Data formatting & validation
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    Basic charts & visualization
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">Intermediate Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <i className="fas fa-check text-blue-500 mr-2"></i>
                    INDEX/MATCH & XLOOKUP
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-blue-500 mr-2"></i>
                    SUMIFS, COUNTIFS, AVERAGEIFS
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-blue-500 mr-2"></i>
                    Pivot tables & pivot charts
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-blue-500 mr-2"></i>
                    Data cleaning & transformation
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-purple-600">Advanced Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <i className="fas fa-check text-purple-500 mr-2"></i>
                    Dynamic arrays & LAMBDA
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-purple-500 mr-2"></i>
                    Power Query basics
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-purple-500 mr-2"></i>
                    Performance optimization
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-purple-500 mr-2"></i>
                    Dashboard design & KPIs
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary text-primary-foreground py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Showcase Your Excel Skills?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of professionals who have validated their Excel expertise with our AI-powered assessment.
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            onClick={handleLogin}
            className="mr-4"
            data-testid="button-cta-start"
          >
            Start Your Assessment
          </Button>
          <div className="mt-8 flex items-center justify-center space-x-8 text-sm opacity-75">
            <div className="flex items-center">
              <i className="fas fa-clock mr-2"></i>
              ~45 minutes
            </div>
            <div className="flex items-center">
              <i className="fas fa-certificate mr-2"></i>
              Detailed report
            </div>
            <div className="flex items-center">
              <i className="fas fa-download mr-2"></i>
              Downloadable results
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-table-cells text-primary-foreground text-sm"></i>
              </div>
              <span className="text-lg font-semibold">ExcelAI Interviewer</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 ExcelAI Interviewer. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
