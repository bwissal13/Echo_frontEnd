export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  userFullName: string;
  userAvatar: string;
  likesCount: number;
  isLiked: boolean;
  parentCommentId?: number;
  replies?: Comment[];
  showReplies?: boolean;
} 