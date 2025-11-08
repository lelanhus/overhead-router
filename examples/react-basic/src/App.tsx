import { useRouter } from './hooks/useRouter';
import { router } from './router';

// Link component for client-side navigation
function Link({ href, children, className = '' }: { href: string; children: React.ReactNode; className?: string }) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    router.navigate(href);
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}

// Navigation component
function Navigation() {
  const match = useRouter();
  const currentPath = match?.route.path || '/';

  const navStyle: React.CSSProperties = {
    background: '#fff',
    borderBottom: '2px solid #e0e0e0',
    padding: '1rem 2rem',
    marginBottom: '2rem',
  };

  const navListStyle: React.CSSProperties = {
    display: 'flex',
    gap: '2rem',
    listStyle: 'none',
  };

  const linkStyle = (path: string): React.CSSProperties => ({
    color: currentPath === path ? '#0066cc' : '#333',
    textDecoration: 'none',
    fontWeight: currentPath === path ? 'bold' : 'normal',
    fontSize: '1rem',
  });

  return (
    <nav style={navStyle}>
      <ul style={navListStyle}>
        <li><Link href="/" className="nav-link" style={linkStyle('/')}>Home</Link></li>
        <li><Link href="/users" className="nav-link" style={linkStyle('/users')}>Users</Link></li>
        <li><Link href="/posts" className="nav-link" style={linkStyle('/posts')}>Posts</Link></li>
        <li><Link href="/about" className="nav-link" style={linkStyle('/about')}>About</Link></li>
      </ul>
    </nav>
  );
}

// Home page component
function HomePage({ data }: { data: any }) {
  return (
    <div>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#333' }}>{data.title}</h1>
      <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '2rem' }}>{data.description}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#0066cc', fontSize: '2rem', marginBottom: '0.5rem' }}>{data.stats.totalUsers}</h3>
          <p style={{ color: '#666' }}>Total Users</p>
        </div>
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#0066cc', fontSize: '2rem', marginBottom: '0.5rem' }}>{data.stats.totalPosts}</h3>
          <p style={{ color: '#666' }}>Total Posts</p>
        </div>
      </div>
    </div>
  );
}

// Users list page component
function UsersPage({ data }: { data: any }) {
  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: '#333' }}>Users ({data.total})</h1>

      <div style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Search users..."
          defaultValue={data.search}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const value = (e.target as HTMLInputElement).value;
              router.navigate(value ? `/users?search=${value}` : '/users');
            }
          }}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            width: '100%',
            maxWidth: '400px',
          }}
        />
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {data.users.map((user: any) => (
          <div key={user.id} style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <Link href={`/users/${user.id}`} style={{ textDecoration: 'none', color: '#0066cc', fontSize: '1.2rem', fontWeight: 'bold' }}>
              {user.name}
            </Link>
            <p style={{ color: '#666', marginTop: '0.5rem' }}>{user.email}</p>
            <span style={{ display: 'inline-block', marginTop: '0.5rem', padding: '0.25rem 0.75rem', background: '#f0f0f0', borderRadius: '12px', fontSize: '0.875rem' }}>
              {user.role}
            </span>
          </div>
        ))}

        {data.users.length === 0 && (
          <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>No users found.</p>
        )}
      </div>
    </div>
  );
}

// User detail page component
function UserDetailPage({ data }: { data: any }) {
  return (
    <div>
      <Link href="/users" style={{ color: '#0066cc', textDecoration: 'none', marginBottom: '1rem', display: 'inline-block' }}>
        &larr; Back to Users
      </Link>

      <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#333' }}>{data.user.name}</h1>
        <p style={{ color: '#666', marginBottom: '0.5rem' }}>{data.user.email}</p>
        <span style={{ display: 'inline-block', padding: '0.25rem 0.75rem', background: '#f0f0f0', borderRadius: '12px', fontSize: '0.875rem' }}>
          {data.user.role}
        </span>
      </div>

      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#333' }}>Posts by {data.user.name} ({data.posts.length})</h2>

      {data.posts.length > 0 ? (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {data.posts.map((post: any) => (
            <div key={post.id} style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <Link href={`/posts/${post.id}`} style={{ textDecoration: 'none', color: '#0066cc', fontSize: '1.2rem', fontWeight: 'bold' }}>
                {post.title}
              </Link>
              <p style={{ color: '#666', marginTop: '0.5rem' }}>{post.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: '#666', textAlign: 'center', padding: '2rem', background: '#fff', borderRadius: '8px' }}>
          No posts yet.
        </p>
      )}
    </div>
  );
}

// Posts list page component
function PostsPage({ data }: { data: any }) {
  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: '#333' }}>Posts ({data.total})</h1>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {data.posts.map((post: any) => (
          <div key={post.id} style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <Link href={`/posts/${post.id}`} style={{ textDecoration: 'none', color: '#0066cc', fontSize: '1.2rem', fontWeight: 'bold' }}>
              {post.title}
            </Link>
            <p style={{ color: '#666', marginTop: '0.5rem' }}>{post.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Post detail page component
function PostDetailPage({ data }: { data: any }) {
  return (
    <div>
      <Link href="/posts" style={{ color: '#0066cc', textDecoration: 'none', marginBottom: '1rem', display: 'inline-block' }}>
        &larr; Back to Posts
      </Link>

      <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#333' }}>{data.post.title}</h1>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          By{' '}
          <Link href={`/users/${data.author.id}`} style={{ color: '#0066cc', textDecoration: 'none' }}>
            {data.author.name}
          </Link>
        </p>
        <p style={{ color: '#333', fontSize: '1.1rem', lineHeight: '1.6' }}>{data.post.content}</p>
      </div>
    </div>
  );
}

// About page component
function AboutPage({ data }: { data: any }) {
  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#333' }}>{data.title}</h1>
      <p style={{ fontSize: '1rem', color: '#666', marginBottom: '1rem' }}>Version: <code>{data.version}</code></p>
      <p style={{ fontSize: '1.1rem', color: '#333', marginBottom: '2rem', lineHeight: '1.6' }}>{data.description}</p>

      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#333' }}>Features</h2>
      <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.8' }}>
        {data.features.map((feature: string, index: number) => (
          <li key={index} style={{ color: '#333', marginBottom: '0.5rem' }}>{feature}</li>
        ))}
      </ul>
    </div>
  );
}

// Main App component
export function App() {
  const match = useRouter();

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: '#f5f5f5',
  };

  const contentStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem 2rem',
  };

  // Loading state
  if (match?.loading) {
    return (
      <div style={containerStyle}>
        <Navigation />
        <div style={contentStyle}>
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{ fontSize: '1.5rem', color: '#666' }}>Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (match?.error) {
    return (
      <div style={containerStyle}>
        <Navigation />
        <div style={contentStyle}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', border: '2px solid #dc3545' }}>
            <h1 style={{ color: '#dc3545', marginBottom: '1rem' }}>Error</h1>
            <p style={{ color: '#666' }}>{match.error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  // No match
  if (!match) {
    return (
      <div style={containerStyle}>
        <Navigation />
        <div style={contentStyle}>
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#333' }}>404 - Page Not Found</h1>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>The page you're looking for doesn't exist.</p>
            <Link href="/" style={{ color: '#0066cc', textDecoration: 'none', fontSize: '1.1rem' }}>
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Render appropriate page based on route
  let content;

  switch (match.route.path) {
    case '/':
      content = <HomePage data={match.data} />;
      break;
    case '/users':
      content = <UsersPage data={match.data} />;
      break;
    case '/users/:id':
      content = <UserDetailPage data={match.data} />;
      break;
    case '/posts':
      content = <PostsPage data={match.data} />;
      break;
    case '/posts/:id':
      content = <PostDetailPage data={match.data} />;
      break;
    case '/about':
      content = <AboutPage data={match.data} />;
      break;
    default:
      content = <div>Unknown route</div>;
  }

  return (
    <div style={containerStyle}>
      <Navigation />
      <div style={contentStyle}>
        {content}
      </div>
    </div>
  );
}
