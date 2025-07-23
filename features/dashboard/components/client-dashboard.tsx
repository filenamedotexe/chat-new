import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@chat/ui';
import { 
  IconFolders, 
  IconChecklist, 
  IconFileCheck,
  IconMessage,
  IconClock,
  IconAlertCircle
} from '@tabler/icons-react';

export function ClientDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome to Your Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Track your projects and collaborate with our team
        </p>
      </div>

      {/* Action Required Banner */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <IconAlertCircle className="h-5 w-5" />
            Action Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-yellow-700">
            You have 3 deliverables awaiting your approval. Please review them to keep your project moving forward.
          </p>
        </CardContent>
      </Card>

      {/* Project Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <IconFolders className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">1 nearing completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <IconFileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Requires your review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tasks</CardTitle>
            <IconChecklist className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">5 assigned to you</p>
          </CardContent>
        </Card>
      </div>

      {/* Current Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Your Projects</CardTitle>
          <CardDescription>Overview of your active projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">Website Redesign</h3>
                  <p className="text-sm text-muted-foreground">Started 2 weeks ago</p>
                </div>
                <span className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded-md">
                  On Track
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Progress</span>
                  <span className="text-sm font-medium">75%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary rounded-full h-2" style={{ width: '75%' }} />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <IconClock className="h-4 w-4" />
                  Due in 2 weeks
                </span>
                <span className="flex items-center gap-1">
                  <IconMessage className="h-4 w-4" />
                  3 new messages
                </span>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">Marketing Campaign</h3>
                  <p className="text-sm text-muted-foreground">Started 1 month ago</p>
                </div>
                <span className="text-sm px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md">
                  Needs Input
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Progress</span>
                  <span className="text-sm font-medium">45%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary rounded-full h-2" style={{ width: '45%' }} />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <IconClock className="h-4 w-4" />
                  Due in 4 weeks
                </span>
                <span className="flex items-center gap-1">
                  <IconFileCheck className="h-4 w-4" />
                  2 pending approvals
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}