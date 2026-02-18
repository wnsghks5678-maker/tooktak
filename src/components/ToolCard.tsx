import { Link } from 'react-router-dom';

interface ToolCardProps {
    icon: string;
    title: string;
    description: string;
    link: string;
    isComingSoon?: boolean;
}

const ToolCard = ({ icon, title, description, link, isComingSoon = false }: ToolCardProps) => {
    const content = (
        <div
            className={`
        bg-white rounded-xl shadow-sm border border-gray-100 p-6 
        transition-all duration-300 h-full flex flex-col
        ${isComingSoon
                    ? 'opacity-60 cursor-not-allowed'
                    : 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer hover:border-blue-100'
                }
      `}
        >
            <div className="flex justify-between items-start mb-4">
                <span className="text-4xl select-none filter drop-shadow-sm">{icon}</span>
                {isComingSoon && (
                    <span className="bg-amber-50 text-amber-600 text-xs font-medium px-2.5 py-1 rounded-full border border-amber-100">
                        준비중
                    </span>
                )}
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-primary transition-colors">
                {title}
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
                {description}
            </p>
        </div>
    );

    if (isComingSoon) {
        return <div>{content}</div>;
    }

    return (
        <Link to={link} className="block h-full group">
            {content}
        </Link>
    );
};

export default ToolCard;
