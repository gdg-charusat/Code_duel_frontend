import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Loader2,
  PlayCircle,
  Target,
  UserPlus,
  Users,
} from "lucide-react";

import Layout from "@/components/layout/Layout";
import ProgressChart from "@/components/dashboard/ProgressChart";
import InviteUserDialog from "@/components/challenge/InviteUserDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Challenge, LeaderboardEntry } from "@/types";
import { getErrorMessage } from "@/lib/utils";

import {
  useChallenge,
  useChallengeLeaderboard,
  useJoinChallenge,
  useActivateChallenge,
} from "@/hooks/useChallenges";

type ChallengeDetails = Challenge & {
  description?: string;
  ownerId?: string;
  visibility?: "PUBLIC" | "PRIVATE" | string;
};

/* ✅ FIXED TYPE — must match ProgressChart */
type ChartData = {
  date: string;
  solved: number;
  target: number;
};

const ChallengePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  const { data: challengeRaw, isLoading: challengeLoading } = useChallenge(id);
  const challenge = challengeRaw as ChallengeDetails | undefined;

  const { data: leaderboard = [], isLoading: leaderboardLoading } =
    useChallengeLeaderboard(id);

  const joinMutation = useJoinChallenge();
  const activateMutation = useActivateChallenge();

  const isLoading = challengeLoading || leaderboardLoading;

  /* ✅ SAFE DEFAULT DATA */
  const chartData: ChartData[] = [
    { date: "Day 1", solved: 2, target: 5 },
    { date: "Day 2", solved: 4, target: 5 },
    { date: "Day 3", solved: 5, target: 5 },
  ];

  const handleJoinChallenge = async () => {
    if (!id) return;
    try {
      await joinMutation.mutateAsync(id);
      toast({
        title: "Joined challenge!",
        description: "You have successfully joined the challenge.",
      });
    } catch (error: unknown) {
      toast({
        title: "Failed to join challenge",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const handleActivateChallenge = async () => {
    if (!id) return;
    try {
      await activateMutation.mutateAsync({ id, status: "ACTIVE" });
      toast({
        title: "Challenge activated!",
        description: "Your challenge is now active.",
      });
    } catch (error: unknown) {
      toast({
        title: "Failed to activate challenge",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const difficultyDisplay = useMemo(() => {
    if (!challenge?.difficultyFilter?.length) return "Any";
    if (challenge.difficultyFilter.length === 3) return "Any";
    if (challenge.difficultyFilter.length === 1)
      return challenge.difficultyFilter[0];
    return "Mixed";
  }, [challenge]);

  const daysRemaining = useMemo(() => {
    if (!challenge) return 0;
    return Math.max(
      0,
      Math.ceil(
        (new Date(challenge.endDate).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      )
    );
  }, [challenge]);

  const totalDays = useMemo(() => {
    if (!challenge) return 1;
    return Math.max(
      1,
      Math.ceil(
        (new Date(challenge.endDate).getTime() -
          new Date(challenge.startDate).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );
  }, [challenge]);

  const progress = Math.min(
    100,
    Math.max(0, Math.round(((totalDays - daysRemaining) / totalDays) * 100))
  );

  const isMember = useMemo(() => {
    if (!user) return false;
    return leaderboard.some(
      (member: LeaderboardEntry) => member.userId === user.id
    );
  }, [leaderboard, user]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!challenge) {
    return (
      <Layout>
        <div className="text-center py-12">
          <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold">Challenge not found</h2>
          <p className="text-muted-foreground mt-2">
            We couldn't load this challenge.
          </p>
          <Button asChild className="mt-4">
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <Tabs defaultValue="members">
          <TabsList>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="progress">
            {/* ✅ Now type matches */}
            <ProgressChart data={chartData} title="Team Progress" />
          </TabsContent>
        </Tabs>
      </div>

      <InviteUserDialog
        open={
          challenge.visibility === "PRIVATE" &&
          challenge.ownerId === user?.id &&
          isInviteDialogOpen
        }
        onOpenChange={setIsInviteDialogOpen}
        challengeId={challenge.id}
        challengeName={challenge.name}
        existingMemberIds={leaderboard.map(
          (member: LeaderboardEntry) => member.userId
        )}
      />
    </Layout>
  );
};

export default ChallengePage;