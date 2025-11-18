import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Shield, Users, Calendar } from "lucide-react";

const LoginSelection = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to CivicHub</h1>
          <p className="text-xl text-gray-600">Choose your role to continue</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Issue Reporters - Citizens */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Issue Reporters</CardTitle>
              <CardDescription className="text-lg">
                Citizens who want to report issues and track their status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Report civic issues in your area
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Track issue resolution progress
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  View community events and updates
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Access interactive map view
                </li>
              </ul>
              <Link to="/login/reporter" className="block">
                <Button className="w-full" size="lg">
                  Login as Citizen
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Issue Solvers - Officials/NGOs */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Issue Solvers</CardTitle>
              <CardDescription className="text-lg">
                Officials and NGOs who solve and manage civic issues
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  View and manage reported issues
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Update issue status and progress
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Assign issues to team members
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Access administrative dashboard
                </li>
              </ul>
              <Link to="/login/solver" className="block">
                <Button className="w-full" size="lg" variant="outline">
                  Login as Official/NGO
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Event Handlers */}
          <Card className="hover:shadow-lg transition-shadow duration-300 md:col-span-2">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
              <CardTitle className="text-2xl">Event Handlers</CardTitle>
              <CardDescription className="text-lg">
                Organize events and manage registered participants
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-gray-600 grid md:grid-cols-2 gap-2">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  View registered participants
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Manage event details
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Track event attendance
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Export participant lists
                </li>
              </ul>
              <Link to="/login/event-handler" className="block">
                <Button className="w-full" size="lg" variant="secondary">
                  Login as Event Handler
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginSelection;
