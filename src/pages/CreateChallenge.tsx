import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Trophy } from "lucide-react";
import { format, addDays, isAfter, parseISO } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ErrorMessage } from "@/components/ui/error-message";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Layout from "@/components/layout/Layout";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getErrorMessage } from "@/lib/utils";
import DOMPurify from "dompurify";
import { useCreateChallenge } from "@/hooks/useChallenges";

const getTodayString = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

const CreateChallenge: React.FC = () => {
  const STORAGE_KEY = "code-duel-create-challenge";

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dailyTarget, setDailyTarget] = useState("2");
  const [difficulty, setDifficulty] = useState("any");
  const [penaltyAmount, setPenaltyAmount] = useState("5");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [visibility, setVisibility] = useState("PUBLIC");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      setName(data.name || "");
      setDescription(data.description || "");
      setDailyTarget(data.dailyTarget || "2");
      setDifficulty(data.difficulty || "any");
      setPenaltyAmount(data.penaltyAmount || "5");
      setStartDate(data.startDate || "");
      setEndDate(data.endDate || "");
      setVisibility(data.visibility || "PUBLIC");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        name,
        description,
        dailyTarget,
        difficulty,
        penaltyAmount,
        startDate,
        endDate,
        visibility,
      })
    );
  }, [
    name,
    description,
    dailyTarget,
    difficulty,
    penaltyAmount,
    startDate,
    endDate,
    visibility,
  ]);

  const today = format(new Date(), "yyyy-MM-dd");
  const minEndDate = startDate
    ? format(addDays(parseISO(startDate), 1), "yyyy-MM-dd")
    : today;

  const navigate = useNavigate();
  const { toast } = useToast();
  const createMutation = useCreateChallenge();

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Challenge name is required";
    if (!dailyTarget || parseInt(dailyTarget) < 1)
      newErrors.dailyTarget = "Daily target must be at least 1";
    if (!penaltyAmount || parseInt(penaltyAmount) < 0)
      newErrors.penaltyAmount = "Penalty amount must be 0 or more";
    if (!startDate) newErrors.startDate = "Start date is required";
    if (!endDate) newErrors.endDate = "End date is required";
    if (startDate && endDate && new Date(startDate) >= new Date(endDate))
      newErrors.endDate = "End date must be after start date";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const difficultyFilter: string[] = [];
      if (difficulty === "easy") difficultyFilter.push("Easy");
      else if (difficulty === "medium") difficultyFilter.push("Medium");
      else if (difficulty === "hard") difficultyFilter.push("Hard");

      await createMutation.mutateAsync({
        name: DOMPurify.sanitize(name.trim()),
        description:
          DOMPurify.sanitize(description.trim()) ||
          `${name} - Solve ${dailyTarget} problem(s) daily`,
        minSubmissionsPerDay: parseInt(dailyTarget),
        difficultyFilter,
        uniqueProblemConstraint: true,
        penaltyAmount: parseInt(penaltyAmount),
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        visibility: visibility as "PUBLIC" | "PRIVATE",
      });

      localStorage.removeItem(STORAGE_KEY);

      toast({
        title: "Challenge created!",
        description: "Your challenge has been created successfully.",
      });

      navigate("/");
    } catch (error: unknown) {
      toast({
        title: "Failed to create challenge",
        description: DOMPurify.sanitize(getErrorMessage(error)),
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="ghost" size="sm" asChild className="gap-2">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl">
              Create New Challenge
            </CardTitle>
            <CardDescription>
              Set up a coding challenge to compete with friends
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">

              <Label htmlFor="name">Challenge Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <ErrorMessage message={errors.name} />
              <div className="space-y-2">
                <Label htmlFor="name">Challenge Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., January Grind, Hard Mode Warriors"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your challenge..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dailyTarget">Daily Target</Label>
                  <Input
                    id="dailyTarget"
                    type="number"
                    min="1"
                    placeholder="2"
                    value={dailyTarget}
                    onChange={(e) => setDailyTarget(e.target.value)}
                    className={errors.dailyTarget ? "border-destructive" : ""}
                  />
                  {errors.dailyTarget && (
                    <p className="text-xs text-destructive">
                      {errors.dailyTarget}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Problems to solve per day
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Minimum Difficulty</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger id="difficulty">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Difficulty</SelectItem>
                      <SelectItem value="easy">Easy or Higher</SelectItem>
                      <SelectItem value="medium">Medium or Higher</SelectItem>
                      <SelectItem value="hard">Hard Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="penaltyAmount">Penalty Amount ($)</Label>
                <Input
                  id="penaltyAmount"
                  type="number"
                  min="0"
                  placeholder="5"
                  value={penaltyAmount}
                  onChange={(e) => setPenaltyAmount(e.target.value)}
                  className={errors.penaltyAmount ? "border-destructive" : ""}
                />
                {errors.penaltyAmount && (
                  <p className="text-xs text-destructive">
                    {errors.penaltyAmount}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Amount charged for each missed day
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    min={getTodayString()}
                    value={startDate}

                    onChange={(e) => {
                      const newStartDate = e.target.value;
                      setStartDate(newStartDate);
                      if (
                        endDate &&
                        newStartDate &&
                        !isAfter(parseISO(endDate), parseISO(newStartDate))
                      ) {
                        setEndDate("");
                      }
                    }}
                    className={errors.startDate ? "border-destructive" : ""}
                  />
                  {errors.startDate && (
                    <p className="text-xs text-destructive">
                      {errors.startDate}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    min={startDate || getTodayString()}
                    value={endDate}

                    disabled={!startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={errors.endDate ? "border-destructive" : ""}
                  />
                  {errors.endDate && (
                    <p className="text-xs text-destructive">{errors.endDate}</p>
                  )}
                </div>
              </div>

              {/* Visibility Radio button */}
              <div className="space-y-2">
                <Label>Visibility</Label>
                <RadioGroup value={visibility} onValueChange={setVisibility}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="PUBLIC" id="public" />
                    <Label htmlFor="public" className="cursor-pointer">Public</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="PRIVATE" id="private" />
                    <Label htmlFor="private" className="cursor-pointer">Private</Label>
                  </div>
                </RadioGroup>
                <p className="text-xs text-muted-foreground">
                  Public challenges are visible to all users. Private challenges are only visible to the owner and invited members.
                </p>
              </div>

 3baf9cb (merge main into safe-state-persistence)

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
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CreateChallenge;