// src/pages/CreateChallenge.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Trophy } from "lucide-react";
import { format, addDays, parseISO, isAfter } from "date-fns";
import DOMPurify from "dompurify";

import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";

// ✅ Correct: centralized mutation hook
import { useCreateChallenge } from "@/hooks/useChallenges";

const getTodayString = () => format(new Date(), "yyyy-MM-dd");

const CreateChallenge: React.FC = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dailyTarget, setDailyTarget] = useState("2");
  const [difficulty, setDifficulty] = useState("any");
  const [penaltyAmount, setPenaltyAmount] = useState("5");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const navigate = useNavigate();
  const { toast } = useToast();
  const createMutation = useCreateChallenge();

  const today = getTodayString();
  const minEndDate = startDate
    ? format(addDays(parseISO(startDate), 1), "yyyy-MM-dd")
    : today;

  // ==============================
  // Validation
  // ==============================
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Challenge name is required";
    if (!dailyTarget || parseInt(dailyTarget, 10) < 1)
      newErrors.dailyTarget = "Daily target must be at least 1";
    if (!penaltyAmount || parseInt(penaltyAmount, 10) < 0)
      newErrors.penaltyAmount = "Penalty must be 0 or more";
    if (!startDate) newErrors.startDate = "Start date is required";
    if (!endDate) newErrors.endDate = "End date is required";
    if (startDate && endDate && new Date(startDate) >= new Date(endDate))
      newErrors.endDate = "End date must be after start date";
    if (startDate && startDate < today)
      newErrors.startDate = "Start date cannot be in the past";
    if (endDate && endDate < today)
      newErrors.endDate = "End date cannot be in the past";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ==============================
  // Submit
  // ==============================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const difficultyFilter: string[] =
        difficulty === "easy"
          ? ["Easy"]
          : difficulty === "medium"
          ? ["Medium"]
          : difficulty === "hard"
          ? ["Hard"]
          : [];

      await createMutation.mutateAsync({
        name: DOMPurify.sanitize(name.trim()),
        description:
          DOMPurify.sanitize(description.trim()) ||
          `${name} - Solve ${dailyTarget} problem(s) daily`,
        minSubmissionsPerDay: parseInt(dailyTarget, 10),
        difficultyFilter,
        uniqueProblemConstraint: true,
        penaltyAmount: parseInt(penaltyAmount, 10),
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        visibility,
      });

      toast({
        title: "Challenge created!",
        description: "Your challenge has been created successfully.",
      });

      navigate("/");
    } catch (error: unknown) {
      const err = error as { message?: string; response?: { data?: { message?: string } } };
      toast({
        title: "Failed to create challenge",
        description: DOMPurify.sanitize(
          err.response?.data?.message || err.message || "Please try again."
        ),
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
                <Trophy className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-2xl">Create New Challenge</CardTitle>
                <CardDescription>
                  Set up a coding challenge to compete with friends
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Challenge Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., January Grind"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name}</p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate("/")}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  className="flex-1 gradient-primary"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Challenge"
                  )}
                </Button>
              </div>
            </form >
          </CardContent >
        </Card >
      </div >
    </Layout >
  );
};

export default CreateChallenge;