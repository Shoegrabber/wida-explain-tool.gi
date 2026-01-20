import type { MentorData, BankSentence } from './types';

export const MENTOR_CONTENT: MentorData = {
    title: "How Weathering and Erosion Shape the Earth",
    paragraphs: [
        {
            id: "p1",
            sentenceIds: ["s1", "s2", "s3"]
        },
        {
            id: "p2",
            sentenceIds: ["s4", "s5", "s6", "s7", "s8", "s9"]
        },
        {
            id: "p3",
            sentenceIds: ["s10", "s11", "s12", "s13", "s14"]
        },
        {
            id: "p4",
            sentenceIds: ["s15", "s16", "s17", "s18"]
        }
    ],
    sentences: {
        "s1": {
            id: "s1",
            originalText: "Weathering and erosion are two natural processes that slowly change Earth’s surface.",
            currentText: "Weathering and erosion are two natural processes that slowly change Earth’s surface.",
            function: "INTRO",
            hotspots: [{ text: "Weathering and erosion" }, { text: "Earth’s surface" }]
        },
        "s2": {
            id: "s2",
            originalText: "While weathering means breaking down rocks into smaller pieces, erosion is the movement of those pieces to new places.",
            currentText: "While weathering means breaking down rocks into smaller pieces, erosion is the movement of those pieces to new places.",
            function: "INTRO",
            hotspots: [{ text: "breaking down rocks" }, { text: "movement of those pieces" }]
        },
        "s3": {
            id: "s3",
            originalText: "Together, weathering and erosion explain how huge rocks can turn into tiny grains of sand over time.",
            currentText: "Together, weathering and erosion explain how huge rocks can turn into tiny grains of sand over time.",
            function: "INTRO",
            hotspots: [{ text: "huge rocks" }, { text: "tiny grains of sand" }]
        },
        "s4": {
            id: "s4",
            originalText: "First, weathering cracks and wears down rock.",
            currentText: "First, weathering cracks and wears down rock.",
            function: "SEQ",
            hotspots: [{ text: "weathering cracks" }]
        },
        "s5": {
            id: "s5",
            originalText: "For example, water can seep into cracks in a boulder.",
            currentText: "For example, water can seep into cracks in a boulder.",
            function: "EXAMPLE_DETAIL",
            hotspots: [{ text: "water can seep" }]
        },
        "s6": {
            id: "s6",
            originalText: "When the temperature drops, the water freezes and expands, so the rock splits apart.",
            currentText: "When the temperature drops, the water freezes and expands, so the rock splits apart.",
            function: "CAUSE_EFFECT",
            hotspots: [{ text: "water freezes and expands" }]
        },
        "s7": {
            id: "s7",
            originalText: "Similarly, wind can blow sand against rock and slowly grind it down.",
            currentText: "Similarly, wind can blow sand against rock and slowly grind it down.",
            function: "EXAMPLE_DETAIL",
            hotspots: [{ text: "wind can blow sand" }]
        },
        "s8": {
            id: "s8",
            originalText: "Even plant roots can grow into cracks and pry rocks apart.",
            currentText: "Even plant roots can grow into cracks and pry rocks apart.",
            function: "EXAMPLE_DETAIL",
            hotspots: [{ text: "plant roots can grow" }]
        },
        "s9": {
            id: "s9",
            originalText: "As a result of weathering, even hard rock breaks into smaller pieces after many years.",
            currentText: "As a result of weathering, even hard rock breaks into smaller pieces after many years.",
            function: "CAUSE_EFFECT",
            hotspots: [{ text: "breaks into smaller pieces" }]
        },
        "s10": {
            id: "s10",
            originalText: "Next, erosion carries the broken pieces away.",
            currentText: "Next, erosion carries the broken pieces away.",
            function: "SEQ",
            hotspots: [{ text: "carries the broken pieces away" }]
        },
        "s11": {
            id: "s11",
            originalText: "First, flowing water washes small rock pieces into streams and rivers.",
            currentText: "First, flowing water washes small rock pieces into streams and rivers.",
            function: "SEQ",
            hotspots: [{ text: "flowing water washes" }]
        },
        "s12": {
            id: "s12",
            originalText: "Then the wind picks up dust and sand and blows it to new places.",
            currentText: "Then the wind picks up dust and sand and blows it to new places.",
            function: "SEQ",
            hotspots: [{ text: "wind picks up dust" }]
        },
        "s13": {
            id: "s13",
            originalText: "Finally, gravity can cause rocks and soil to roll downhill.",
            currentText: "Finally, gravity can cause rocks and soil to roll downhill.",
            function: "SEQ",
            hotspots: [{ text: "gravity can cause rocks" }]
        },
        "s14": {
            id: "s14",
            originalText: "As a result, bits of rock that started on a mountain might end up far away from where they began.",
            currentText: "As a result, bits of rock that started on a mountain might end up far away from where they began.",
            function: "CAUSE_EFFECT",
            hotspots: [{ text: "might end up far away" }]
        },
        "s15": {
            id: "s15",
            originalText: "In conclusion, weathering and erosion work together to slowly reshape the land.",
            currentText: "In conclusion, weathering and erosion work together to slowly reshape the land.",
            function: "CONCLUSION",
            hotspots: [{ text: "slowly reshape the land" }]
        },
        "s16": {
            id: "s16",
            originalText: "Over a long time, mountains become smaller while valleys get deeper.",
            currentText: "Over a long time, mountains become smaller while valleys get deeper.",
            function: "EXAMPLE_DETAIL",
            hotspots: [{ text: "mountains become smaller" }]
        },
        "s17": {
            id: "s17",
            originalText: "Because of these processes, even a tall, jagged mountain can turn into a lower, rounded hill.",
            currentText: "Because of these processes, even a tall, jagged mountain can turn into a lower, rounded hill.",
            function: "CAUSE_EFFECT",
            hotspots: [{ text: "lower, rounded hill" }]
        },
        "s18": {
            id: "s18",
            originalText: "Weathering and erosion are always changing the Earth’s surface little by little each day.",
            currentText: "Weathering and erosion are always changing the Earth’s surface little by little each day.",
            function: "CONCLUSION",
            hotspots: [{ text: "little by little each day" }]
        }
    },
    functionalLabels: {
        INTRO: "Introduction",
        SEQ: "Step-by-Step Order",
        CAUSE_EFFECT: "Cause and Effect",
        EXAMPLE_DETAIL: "Description & Details",
        CONCLUSION: "Conclusion"
    }
};

export const DEFAULT_BANK: BankSentence[] = [
    {
        id: "bank1",
        originalText: "Water flows over rocks and carries them away.",
        currentText: "Water flows over rocks and carries them away.",
        function: "EXAMPLE_DETAIL",
        section: "STARTERS"
    },
    {
        id: "bank2",
        originalText: "Ice can split huge boulders apart over time.",
        currentText: "Ice can split huge boulders apart over time.",
        function: "CAUSE_EFFECT",
        section: "STARTERS"
    },
    {
        id: "bank3",
        originalText: "First, the rain washes minerals out of the rocks.",
        currentText: "First, the rain washes minerals out of the rocks.",
        function: "SEQ",
        section: "STARTERS"
    },
    {
        id: "bank4",
        originalText: "Strong winds grind mountains down into sand.",
        currentText: "Strong winds grind mountains down into sand.",
        function: "EXAMPLE_DETAIL",
        section: "STARTERS"
    },
    {
        id: "bank5",
        originalText: "As a result, the landscape changes slowly each day.",
        currentText: "As a result, the landscape changes slowly each day.",
        function: "CAUSE_EFFECT",
        section: "STARTERS"
    },
    {
        id: "bank6",
        originalText: "In conclusion, weathering and erosion reshape our world.",
        currentText: "In conclusion, weathering and erosion reshape our world.",
        function: "CONCLUSION",
        section: "STARTERS"
    }
];
