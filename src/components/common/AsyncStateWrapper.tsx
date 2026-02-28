import React from "react";
import { LucideIcon } from "lucide-react";
import EmptyState from "@/components/common/EmptyState";
import { Skeleton } from "@/components/common/Skeleton";

interface AsyncStateWrapperProps {
    isLoading?: boolean;
    hasError?: boolean;
    isEmpty?: boolean;
    emptyIcon?: LucideIcon;
    emptyTitle?: string;
    emptyDescription?: string;
    errorIcon?: LucideIcon;
    errorTitle?: string;
    errorDescription?: string;
    children: React.ReactNode;
}

const AsyncStateWrapper: React.FC<AsyncStateWrapperProps> = ({
    isLoading = false,
    hasError = false,
    isEmpty = false,
    emptyIcon,
    emptyTitle = "No Data Available",
    emptyDescription = "Nothing to show here yet.",
    errorIcon,
    errorTitle = "Something went wrong",
    errorDescription = "Please try refreshing the page.",
    children,
}) => {
    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton />
                <Skeleton />
                <Skeleton />
            </div>
        );
    }

    if (hasError) {
        return (
            <EmptyState
                icon={errorIcon}
                title={errorTitle}
                description={errorDescription}
            />
        );
    }

    if (isEmpty) {
        return (
            <EmptyState
                icon={emptyIcon}
                title={emptyTitle}
                description={emptyDescription}
            />
        );
    }

    return <>{children}</>;
};

export default AsyncStateWrapper;