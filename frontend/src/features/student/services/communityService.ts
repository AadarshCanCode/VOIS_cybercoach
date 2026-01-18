import { supabase } from '@lib/supabase';

export interface Post {
    id: string;
    author: {
        name: string;
        role: string;
        avatar?: string;
    };
    content: string;
    tags: string[];
    likes: number;
    comments: number;
    shares: number;
    timestamp: string;
    category: 'social' | 'technical';
    created_at?: string;
}

export interface Comment {
    id: string;
    post_id: string;
    author: {
        name: string;
        role: string;
        avatar?: string;
    };
    content: string;
    created_at: string;
    timestamp?: string;
}

export const communityService = {
    async getPosts() {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching posts:', error);
            return [];
        }

        return data.map((post: any) => ({
            ...post,
            timestamp: new Date(post.created_at).toLocaleString(),
            author: post.author || { name: 'Anonymous', role: 'Student' },
            shares: post.shares || 0
        })) as Post[];
    },

    async createPost(post: Omit<Post, 'id' | 'timestamp' | 'likes' | 'comments' | 'shares'>) {
        const { data, error } = await supabase
            .from('posts')
            .insert([{
                ...post,
                likes: 0,
                comments: 0,
                shares: 0,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) {
            console.error('Error creating post:', error);
            throw error;
        }

        return {
            ...data,
            timestamp: 'Just now',
            author: data.author || post.author
        } as Post;
    },

    subscribeToPosts(callback: (payload: any) => void) {
        return supabase
            .channel('public:posts')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, callback)
            .subscribe();
    },

    async likePost(postId: string) {
        const { data: post, error: fetchError } = await supabase
            .from('posts')
            .select('likes')
            .eq('id', postId)
            .single();

        if (fetchError) return;

        const { error } = await supabase
            .from('posts')
            .update({ likes: (post?.likes || 0) + 1 })
            .eq('id', postId);

        if (error) {
            console.error('Error liking post:', error);
        }
    },

    async sharePost(postId: string) {
        const { data: post, error: fetchError } = await supabase
            .from('posts')
            .select('shares')
            .eq('id', postId)
            .single();

        if (fetchError) return;

        const { error } = await supabase
            .from('posts')
            .update({ shares: (post?.shares || 0) + 1 })
            .eq('id', postId);

        if (error) {
            console.error('Error sharing post:', error);
        }
    },

    async getComments(postId: string) {
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('post_id', postId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching comments:', error);
            return [];
        }

        return data.map((comment: any) => ({
            ...comment,
            timestamp: new Date(comment.created_at).toLocaleString()
        })) as Comment[];
    },

    async createComment(comment: Omit<Comment, 'id' | 'created_at' | 'timestamp'>) {
        const { data, error } = await supabase
            .from('comments')
            .insert([{
                ...comment,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) {
            console.error('Error creating comment:', error);
            throw error;
        }

        // Increment comment count on post
        const { data: post } = await supabase
            .from('posts')
            .select('comments')
            .eq('id', comment.post_id)
            .single();

        if (post) {
            await supabase
                .from('posts')
                .update({ comments: (post.comments || 0) + 1 })
                .eq('id', comment.post_id);
        }

        return {
            ...data,
            timestamp: 'Just now'
        } as Comment;
    },

    subscribeToComments(callback: (payload: any) => void) {
        return supabase
            .channel('public:comments')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' }, callback)
            .subscribe();
    }
};
