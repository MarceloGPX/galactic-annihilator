import React from 'react';

interface MovementArrowsProps {
    onMoveStart: (direction: -1 | 1) => void;
    onMoveEnd: () => void;
}

const ArrowButton: React.FC<{
    direction: -1 | 1,
    onMoveStart: (direction: -1 | 1) => void,
    onMoveEnd: () => void
}> = ({ direction, onMoveStart, onMoveEnd }) => {

    const handlePress = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        onMoveStart(direction);
    };

    const handleRelease = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        onMoveEnd();
    };

    return (
        <button
            className="w-20 h-20 md:w-24 md:h-24 bg-black/30 border-2 border-cyan-400/50 backdrop-blur-sm rounded-full flex justify-center items-center text-cyan-400 text-4xl active:bg-cyan-400/50 transition-colors"
            onMouseDown={handlePress}
            onMouseUp={handleRelease}
            onMouseLeave={handleRelease}
            onTouchStart={handlePress}
            onTouchEnd={handleRelease}
            onTouchCancel={handleRelease}
            aria-label={direction === -1 ? 'Move left' : 'Move right'}
        >
            <svg 
                width="60" 
                height="60" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                style={{ transform: direction === -1 ? 'rotate(180deg)' : 'none' }}
            >
                <path d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z" />
            </svg>
        </button>
    );
};

const MovementArrows: React.FC<MovementArrowsProps> = ({ onMoveStart, onMoveEnd }) => {
    return (
        <div className="flex gap-4">
            <ArrowButton direction={-1} onMoveStart={onMoveStart} onMoveEnd={onMoveEnd} />
            <ArrowButton direction={1} onMoveStart={onMoveStart} onMoveEnd={onMoveEnd} />
        </div>
    );
};

export default MovementArrows;