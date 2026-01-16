import { signInWithMagicLink } from '@/auth/context';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';

export function InviteUserDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendInvite = async () => {
    setIsLoading(true);
    try {
      await signInWithMagicLink({ email: email, shouldCreateUser: true });
      setIsLoading(false);
      toast.success('Invite sent successfully');
      setEmail('');
      onClose();
    } catch (error: any) {
      toast.error(error?.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Invite User</DialogTitle>
          <DialogDescription>
            Enter the email of the user you want to invite.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4'>
          <div className='grid gap-3'>
            <Label htmlFor='email-1'>Email</Label>
            <Input
              id='email-1'
              name='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline'>Cancel</Button>
          </DialogClose>
          <Button type='submit' onClick={handleSendInvite} disabled={isLoading}>
            {isLoading && <Loader2Icon className='animate-spin' />} Send Invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
