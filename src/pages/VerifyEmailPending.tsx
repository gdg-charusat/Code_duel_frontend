import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, Mail, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const VerifyEmailPending: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-scale-in">
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2 font-semibold text-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary shadow-glow">
              <Code2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <span>LeetCode Tracker</span>
          </Link>
        </div>

        <Card className="border-2">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Verify your email</CardTitle>
            <CardDescription>
              We've sent a verification link to your email address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground space-y-2">
              <p>Please check your inbox and click the verification link to activate your account.</p>
              <p>Once verified, you'll be able to log in and start tracking your coding progress.</p>
            </div>

            <div className="pt-4">
              <Link to="/login">
                <Button className="w-full gradient-primary">
                  Go to Login
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Didn't receive the email? Check your spam folder
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerifyEmailPending;
