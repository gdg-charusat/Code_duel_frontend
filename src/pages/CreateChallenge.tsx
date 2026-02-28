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
import { challengeApi } from "@/lib/api";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import DOMPurify from "dompurify";

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
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ Restore saved state on reload
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

  // ✅ Persist state on change
  useEffect(() => {
    const data = {
      name,
      description,
      dailyTarget,
      difficulty,
      penaltyAmount,
      startDate,
      endDate,
      visibility,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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

    setIsLoading(true);

    try {
      const difficultyFilter: string[] = [];
      if (difficulty === "easy") difficultyFilter.push("Easy", "Medium", "Hard");
      else if (difficulty === "medium") difficultyFilter.push("Medium", "Hard");
      else if (difficulty === "hard") difficultyFilter.push("Hard");

      const response = await challengeApi.create({
        name,
        description:
          description || `${name} - Solve ${dailyTarget} problem(s) daily`,
        minSubmissionsPerDay: parseInt(dailyTarget),
        difficultyFilter,
        uniqueProblemConstraint: true,
        penaltyAmount: parseInt(penaltyAmount),
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        visibility: visibility as "PUBLIC" | "PRIVATE",
      });

      if (response.success) {
        toast({
          title: "Challenge created!",
          description: "Your challenge has been created successfully.",
        });

        // ✅ Clear persisted state after successful submission
        localStorage.removeItem(STORAGE_KEY);

        navigate("/");
      } else {
        throw new Error(response.message || "Failed to create challenge");
      }
    } catch (error: any) {
      toast({
        title: "Failed to create challenge",
        description: DOMPurify.sanitize(
          error.response?.data?.message || error.message || "Please try again."
        ),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };