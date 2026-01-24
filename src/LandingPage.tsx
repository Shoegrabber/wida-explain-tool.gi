import React from 'react';

interface LandingPageProps {
    onSelectLesson: (lessonId: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onSelectLesson }) => {
    const lessons = [
        {
            id: 'weathering',
            title: 'Grade 4 Science: Weathering and Erosion',
            description: 'Learn how natural processes shape our planet through weathering and erosion.',
            icon: '🌍'
        },
        {
            id: 'g4-argue-plastic',
            title: 'Grade 4 Architecture: Reducing Plastic Pollution',
            description: 'Arguing for sustainable solutions to reduce environmental impact.',
            icon: '♻️'
        }
    ];

    return (
        <div className="landing-page-component">
            <div className="landing-page">
                <header className="landing-header">
                    <h1>WIDA Explain Tool</h1>
                    <p>Select a lesson to get started</p>
                </header>

                <div className="lesson-grid">
                    {lessons.map(lesson => (
                        <div
                            key={lesson.id}
                            className="lesson-card"
                            onClick={() => onSelectLesson(lesson.id)}
                        >
                            <div className="lesson-icon">{lesson.icon}</div>
                            <div className="lesson-info">
                                <h3>{lesson.title}</h3>
                                <p>{lesson.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
