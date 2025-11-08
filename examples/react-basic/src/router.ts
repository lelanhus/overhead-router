import { createRouter, route } from '@overhead/router';

// Mock API delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data
const users = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin' },
  { id: '2', name: 'Bob Smith', email: 'bob@example.com', role: 'User' },
  { id: '3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'User' },
];

const posts = [
  { id: '1', userId: '1', title: 'Getting Started with @overhead/router', content: 'Learn how to use @overhead/router...' },
  { id: '2', userId: '1', title: 'React Integration Guide', content: 'Integrate @overhead/router with React...' },
  { id: '3', userId: '2', title: 'TypeScript Tips', content: 'Best practices for TypeScript...' },
];

// Create router instance with routes
export const router = createRouter([
  route('/', {
    loader: async () => {
      await delay(300);
      return {
        title: 'Welcome to @overhead/router',
        description: 'A simple, type-safe router for modern web applications',
        stats: {
          totalUsers: users.length,
          totalPosts: posts.length,
        },
      };
    },
  }),

  route('/users', {
    loader: async ({ query, signal }) => {
      await delay(400);

      // Check if request was aborted
      if (signal.aborted) {
        throw new Error('Request aborted');
      }

      // Filter users by search query
      const search = query.search?.toLowerCase() || '';
      const filteredUsers = search
        ? users.filter(u =>
            u.name.toLowerCase().includes(search) ||
            u.email.toLowerCase().includes(search)
          )
        : users;

      return {
        users: filteredUsers,
        total: filteredUsers.length,
        search,
      };
    },
  }),

  route('/users/:id', {
    loader: async ({ params, signal }) => {
      await delay(500);

      if (signal.aborted) {
        throw new Error('Request aborted');
      }

      const user = users.find(u => u.id === params.id);

      if (!user) {
        throw new Error(`User with id ${params.id} not found`);
      }

      // Get user's posts
      const userPosts = posts.filter(p => p.userId === params.id);

      return {
        user,
        posts: userPosts,
      };
    },
  }),

  route('/posts', {
    loader: async ({ query, signal }) => {
      await delay(400);

      if (signal.aborted) {
        throw new Error('Request aborted');
      }

      // Filter by author if specified
      const userId = query.author;
      const filteredPosts = userId
        ? posts.filter(p => p.userId === userId)
        : posts;

      return {
        posts: filteredPosts,
        total: filteredPosts.length,
      };
    },
  }),

  route('/posts/:id', {
    loader: async ({ params, signal }) => {
      await delay(500);

      if (signal.aborted) {
        throw new Error('Request aborted');
      }

      const post = posts.find(p => p.id === params.id);

      if (!post) {
        throw new Error(`Post with id ${params.id} not found`);
      }

      const author = users.find(u => u.id === post.userId);

      return {
        post,
        author,
      };
    },
  }),

  route('/about', {
    loader: async () => {
      await delay(300);
      return {
        title: 'About @overhead/router',
        version: '1.0.0',
        description: 'A lightweight, type-safe router built for modern web applications.',
        features: [
          'Type-safe route definitions',
          'Async data loading with loaders',
          'Request cancellation with AbortSignal',
          'Query string and hash support',
          'Framework agnostic core',
        ],
      };
    },
  }),
]);

// Start the router
router.start();
