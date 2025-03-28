
import React, { useState, useEffect } from 'react';
import { userService } from '@/services/api';
import Layout from '@/components/Layout';
import UserCard, { User } from '@/components/UserCard';
import EditUserDialog from '@/components/EditUserDialog';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const { toast } = useToast();

  // Fetch users
  const fetchUsers = async (page: number) => {
    try {
      // Use the general loading state for initial load, pagination loading for navigation
      if (page === currentPage) {
        setLoading(true);
      } else {
        setPaginationLoading(true);
      }
      
      const response = await userService.getUsers(page);
      setUsers(response.data);
      setTotalPages(response.total_pages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Could not fetch users. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setPaginationLoading(false);
    }
  };

  // Handle pagination navigation
  const handlePreviousPage = () => {
    if (currentPage > 1 && !paginationLoading) {
      fetchUsers(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages && !paginationLoading) {
      fetchUsers(currentPage + 1);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchUsers(currentPage);
  }, []);

  // Apply search filter
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter((user) => 
        user.first_name.toLowerCase().includes(query) ||
        user.last_name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  // Handle edit user
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  // Handle save user
  const handleSaveUser = async (id: number, userData: { first_name: string; last_name: string; email: string }) => {
    try {
      await userService.updateUser(id, userData);
      
      // Update user in local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === id 
            ? { ...user, ...userData } 
            : user
        )
      );
      
      toast({
        title: 'Success',
        description: 'User information updated successfully',
      });
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Handle delete user
  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      await userService.deleteUser(userToDelete.id);
      
      // Remove user from local state
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userToDelete.id));
      
      toast({
        title: 'Success',
        description: `${userToDelete.first_name} ${userToDelete.last_name} was deleted successfully`,
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete user. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Render loading skeletons
  if (loading) {
    return (
      <Layout>
        <div className="mb-6">
          <Skeleton className="h-12 w-full max-w-md mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-lg overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <div className="flex justify-between">
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-6">User Management</h1>
        
        {/* Search and pagination */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePreviousPage}
              disabled={currentPage <= 1 || paginationLoading}
              className="min-w-[100px] justify-center"
            >
              {paginationLoading ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </div>
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </>
              )}
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleNextPage}
              disabled={currentPage >= totalPages || paginationLoading}
              className="min-w-[100px] justify-center"
            >
              {paginationLoading ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </div>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* User cards grid with loading overlay during pagination */}
        <div className="relative">
          {paginationLoading && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 rounded-lg">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading users...</p>
              </div>
            </div>
          )}
          
          {filteredUsers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user) => (
                <UserCard 
                  key={user.id} 
                  user={user} 
                  onEdit={handleEditUser} 
                  onDelete={() => handleDeleteClick(user)} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery ? "No users match your search." : "No users found."}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Edit dialog */}
      <EditUserDialog
        user={selectedUser}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleSaveUser}
      />
      
      {/* Delete confirmation dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        userName={userToDelete ? `${userToDelete.first_name} ${userToDelete.last_name}` : ''}
      />
    </Layout>
  );
};

export default Users;
