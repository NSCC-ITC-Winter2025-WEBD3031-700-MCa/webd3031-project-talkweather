interface VerifiedBadgeProps {
    isVerified: boolean;
  }
  
  const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ isVerified }) => {
    if (!isVerified) return null;
  
    return (
      <span className="verified-badge">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-5 h-5 inline-block text-green-500"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
        Verified
      </span>
    );
  };
  
  export default VerifiedBadge;
  