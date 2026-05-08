export default function Skeleton({ height = '20px', width = '100%', borderRadius = '12px' }) {
    return (
      <div className="skeleton-premium">
        <style jsx>{`
          .skeleton-premium {
            height: ${height};
            width: ${width};
            border-radius: ${borderRadius};
            background: linear-gradient(
              90deg,
              var(--bg-badge) 25%,
              var(--border-light) 37%,
              var(--bg-badge) 63%
            );
            background-size: 400% 100%;
            animation: skeleton-shimmer 1.4s ease-in-out infinite;
            border: 1px solid var(--border-light);
          }
  
          @keyframes skeleton-shimmer {
            0% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0 50%;
            }
          }
        `}</style>
      </div>
    );
  }
  
