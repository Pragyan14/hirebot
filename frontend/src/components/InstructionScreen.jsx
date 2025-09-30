const InstructionScreen = ({ onContinue }) => {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
                <h2 className="text-xl font-semibold mb-4">Instructions</h2>
                <ul className="text-left mb-4 space-y-2">
                    <li>1. <strong>Total Questions:</strong> 6 (2 Easy → 2 Medium → 2 Hard).</li>
                    <li>2. <strong>Display:</strong> Questions will appear <em>one at a time</em> in the chat.</li>
                    <li>3. <strong>Reading Time:</strong> You have <span className="font-bold">5 seconds</span> before the timer starts.</li>
                    <li>4. <strong>Time Limits:</strong></li>
                    <ul className="ml-6 list-disc">
                        <li>Easy → 20 seconds</li>
                        <li>Medium → 60 seconds</li>
                        <li>Hard → 120 seconds</li>
                    </ul>
                    <li>5. <strong>Auto-Submit:</strong> When time runs out, your answer is submitted and the next question appears.</li>
                    <li>6. <strong>Note:</strong> You cannot revisit previous questions.</li>
                </ul>
                <button
                    onClick={onContinue}
                    className="w-full bg-blue-500 text-white rounded py-2 hover:bg-blue-600 transition"
                >
                    Start Q&A
                </button>
            </div>
        </div>
    );
};

export default InstructionScreen;