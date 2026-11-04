import { useState } from "react";
import { useIntlayer } from "react-intlayer";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { deleteMyAccount } from "@/server/account-functions";

export const DeleteAccountDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const content = useIntlayer("site-header");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<"active-subscription" | "failed" | null>(
    null
  );

  const onDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      const result = await deleteMyAccount();
      if (!result.ok) {
        setError(result.error);
        setDeleting(false);
        return;
      }
      // Full reload: the session is gone, so every cached view resets.
      window.location.assign(ROUTES.HOME);
    } catch {
      setError("failed");
      setDeleting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!deleting) {
          setError(null);
          onOpenChange(next);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{content.deleteTitle}</DialogTitle>
          <DialogDescription>{content.deleteDescription}</DialogDescription>
        </DialogHeader>
        {error ? (
          <p role="alert" className="text-destructive text-sm">
            {error === "active-subscription"
              ? content.deleteActiveSubscription
              : content.deleteFailed}
          </p>
        ) : null}
        <DialogFooter>
          <DialogClose
            disabled={deleting}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            {content.cancel}
          </DialogClose>
          <Button variant="destructive" disabled={deleting} onClick={onDelete}>
            {deleting ? content.deleting : content.deleteConfirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
