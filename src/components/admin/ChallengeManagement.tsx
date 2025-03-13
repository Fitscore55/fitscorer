
import { useState } from "react";
import { PlusCircle, Search, Edit, Trash2, Trophy, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MOCK_CHALLENGES = [
  { 
    id: "c001", 
    name: "10K Steps Challenge", 
    goal_type: "steps" as const, 
    goal_value: 10000, 
    start_date: "2023-10-15", 
    end_date: "2023-10-30", 
    participants: 24, 
    stake_amount: 50,
    status: "active" as const,
  },
  { 
    id: "c002", 
    name: "Marathon Month", 
    goal_type: "distance" as const, 
    goal_value: 42, 
    start_date: "2023-11-01", 
    end_date: "2023-11-30", 
    participants: 15, 
    stake_amount: 100,
    status: "upcoming" as const,
  },
  { 
    id: "c003", 
    name: "Weekend Warrior", 
    goal_type: "steps" as const, 
    goal_value: 15000, 
    start_date: "2023-09-10", 
    end_date: "2023-09-12", 
    participants: 32, 
    stake_amount: 25,
    status: "completed" as const,
  },
  { 
    id: "c004", 
    name: "Daily 5K", 
    goal_type: "distance" as const, 
    goal_value: 5, 
    start_date: "2023-10-20", 
    end_date: "2023-10-27", 
    participants: 18, 
    stake_amount: 30,
    status: "active" as const,
  },
  { 
    id: "c005", 
    name: "Step Master", 
    goal_type: "steps" as const, 
    goal_value: 20000, 
    start_date: "2023-11-15", 
    end_date: "2023-11-20", 
    participants: 8, 
    stake_amount: 75,
    status: "upcoming" as const,
  },
];

const ChallengeManagement = () => {
  const [challenges, setChallenges] = useState(MOCK_CHALLENGES);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChallenges = challenges.filter(challenge => 
    challenge.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "upcoming":
        return <Badge className="bg-blue-500">Upcoming</Badge>;
      case "completed":
        return <Badge className="bg-gray-500">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const deleteChallenge = (id: string) => {
    setChallenges(challenges.filter(challenge => challenge.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Challenge Management</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm">
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Challenge
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Challenges</CardTitle>
          <CardDescription>Manage active, upcoming, and past challenges.</CardDescription>
          <div className="flex w-full max-w-sm items-center space-x-2 pt-4">
            <Input 
              type="search" 
              placeholder="Search challenges..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
              prefix={<Search className="h-4 w-4 text-muted-foreground" />}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Goal</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Stake</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredChallenges.map((challenge) => (
                <TableRow key={challenge.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-fitscore-500" />
                      {challenge.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    {challenge.goal_type === "steps" 
                      ? `${challenge.goal_value.toLocaleString()} steps` 
                      : `${challenge.goal_value} km`}
                  </TableCell>
                  <TableCell>
                    {new Date(challenge.start_date).toLocaleDateString()} - {new Date(challenge.end_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{challenge.participants}</TableCell>
                  <TableCell>{challenge.stake_amount} coins</TableCell>
                  <TableCell>{getStatusBadge(challenge.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => deleteChallenge(challenge.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChallengeManagement;
