
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
}

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onEdit, onDelete }) => {
  const { id, first_name, last_name, email, avatar } = user;
  
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="p-0">
        <div className="flex justify-center p-6 bg-gradient-to-b from-primary/10 to-transparent">
          <Avatar className="h-24 w-24 border-4 border-white shadow-md">
            <AvatarImage src={avatar} alt={`${first_name} ${last_name}`} />
            <AvatarFallback>{first_name.charAt(0)}{last_name.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
      </CardHeader>
      <CardContent className="text-center pt-3">
        <h3 className="text-lg font-semibold">{first_name} {last_name}</h3>
        <p className="text-sm text-muted-foreground">{email}</p>
        <p className="text-xs text-muted-foreground mt-1">ID: {id}</p>
      </CardContent>
      <CardFooter className="flex justify-between p-4 pt-0">
        <Button variant="outline" size="sm" onClick={() => onEdit(user)}>
          <Edit className="h-4 w-4 mr-1" /> Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(id)}>
          <Trash2 className="h-4 w-4 mr-1" /> Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UserCard;
