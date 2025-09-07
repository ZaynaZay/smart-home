import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Copy, Download } from "lucide-react";
import { toast } from "sonner";

const LocalAgentPage = () => {
  const { session } = useAuth();

  // The user's secure JWT (JSON Web Token) is the session's access token.
  const userJwt = session?.access_token;

  const handleCopy = (text: string | undefined) => {
    if (text) {
      navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } else {
      toast.error("Could not copy key. Are you logged in?");
    }
  };

  // Placeholder for a direct download link if you host the agent script
  const handleDownload = () => {
    toast.info(
      "Direct download coming soon! Please follow manual setup for now."
    );
    // Example: window.location.href = '/path/to/your/agent_script.zip';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Local Agent Setup</h1>
        <p className="text-muted-foreground">
          Follow these steps to connect WellnessHub to your laptop.
        </p>
      </div>
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Step 1: Get Your Agent Code</CardTitle>
          <CardDescription>
            This is the Python script that runs on your computer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            The agent code is located inside the{" "}
            <code>smart-home-backend/agent/</code> directory of the project
            files. For now, we will run it directly from there.
          </p>
          <Button onClick={handleDownload} disabled>
            <Download className="mr-2 h-4 w-4" />
            Download Agent (Coming Soon)
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Step 2: Configure Your Agent</CardTitle>
          <CardDescription>
            Create a <code>.env</code> file inside the{" "}
            <code>smart-home-backend/agent/</code> folder and paste in the
            following content, replacing the placeholder values.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-2">
            <div>
              <span>SUPABASE_URL="</span>
              <span className="text-primary">YOUR_SUPABASE_URL_HERE</span>
              <span>"</span>
            </div>
            <div>
              <span>SUPABASE_JWT="</span>
              <span className="text-primary">YOUR_USER_SPECIFIC_JWT_HERE</span>
              <span>"</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Step 3: Get Your Secure Key (JWT)</CardTitle>
          <CardDescription>
            This is your personal, secure key. Do not share it. Copy it and
            paste it as the value for <code>SUPABASE_JWT</code> in your{" "}
            <code>.env</code> file.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userJwt ? (
            <div className="flex items-center space-x-2">
              <code className="bg-muted p-2 rounded-md text-sm truncate w-full">
                {userJwt}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopy(userJwt)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <p className="text-destructive">
              Could not load user key. Please log in again.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Step 4: Run the Agent</CardTitle>
          <CardDescription>
            Open a terminal, navigate to the agent's directory, activate the
            environment, and run the script.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <code className="bg-muted p-4 rounded-lg font-mono text-sm block">
            <div>$ cd /path/to/your/smart-home-backend</div>
            <div>$ source venv/bin/activate</div>
            <div>$ cd agent</div>
            <div>$ python local_agent.py</div>
          </code>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocalAgentPage;
