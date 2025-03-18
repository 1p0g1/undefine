// Helper function to generate letter count display
function generateLetterCountDisplay(word) {
    const count = word.length;
    const underscores = Array(count).fill('_').join(' ');
    return {
        count,
        display: `[${count}]: ${underscores}`
    };
}
export const words = [
    {
        "word": "apple",
        "partOfSpeech": "noun",
        "definition": "A round fruit with red or green skin and a whitish interior, typically eaten raw or used in cooking. (noun)",
        "alternateDefinition": "The tree (Malus domestica) that bears apples. (noun)",
        "letterCount": generateLetterCountDisplay("apple")
    },
    {
        "word": "big",
        "partOfSpeech": "adjective",
        "synonyms": ["large", "huge", "great"],
        "definition": "Of considerable size, extent, or intensity. (adjective)",
        "alternateDefinition": "Of considerable importance or seriousness. (adjective)",
        "letterCount": generateLetterCountDisplay("big")
    },
    {
        "word": "run",
        "partOfSpeech": "verb,noun",
        "synonyms": ["jog", "sprint", "dash"],
        "definition": "To move swiftly on foot so that both feet leave the ground during each stride. (verb)",
        "alternateDefinition": "An act or instance of running. (noun)",
        "letterCount": generateLetterCountDisplay("run")
    },
    {
        "word": "happy",
        "partOfSpeech": "adjective",
        "synonyms": ["joyful", "cheerful", "content"],
        "definition": "Feeling or showing pleasure or contentment. (adjective)",
        "alternateDefinition": "Fortunate and convenient. (adjective)",
        "letterCount": generateLetterCountDisplay("happy")
    },
    {
        "word": "dog",
        "partOfSpeech": "noun",
        "definition": "A domesticated carnivorous mammal (Canis familiaris) typically kept as a pet or for work. (noun)",
        "alternateDefinition": "To follow someone closely and persistently. (verb)",
        "letterCount": generateLetterCountDisplay("dog")
    },
    {
        "word": "jump",
        "partOfSpeech": "verb",
        "definition": "To push oneself off a surface and into the air by using the muscles in one's legs and feet. (verb)",
        "alternateDefinition": "An act of jumping from a surface. (noun)",
        "letterCount": generateLetterCountDisplay("jump")
    },
    {
        "word": "quick",
        "partOfSpeech": "adjective",
        "synonyms": ["fast", "speedy", "swift"],
        "definition": "Moving fast or doing something in a short time. (adjective)",
        "alternateDefinition": "Prompt to understand, think, or learn. (adjective)",
        "letterCount": generateLetterCountDisplay("quick")
    },
    {
        "word": "blue",
        "partOfSpeech": "adjective",
        "definition": "Of a color intermediate between green and violet, as of the sky or sea on a sunny day. (adjective)",
        "alternateDefinition": "Melancholy, sad, or depressed. (adjective)",
        "letterCount": generateLetterCountDisplay("blue")
    },
    {
        "word": "smile",
        "partOfSpeech": "noun",
        "definition": "To form one's features into a pleased, kind, or amused expression, typically with the corners of the mouth turned up. (verb)",
        "alternateDefinition": "A pleased, kind, or amused facial expression. (noun)",
        "letterCount": generateLetterCountDisplay("smile")
    },
    {
        "word": "rain",
        "partOfSpeech": "noun",
        "definition": "Moisture condensed from the atmosphere that falls visibly in separate drops. (noun)",
        "alternateDefinition": "To fall as rain. (verb)",
        "letterCount": generateLetterCountDisplay("rain")
    },
    {
        "word": "cat",
        "partOfSpeech": "noun",
        "definition": "A small domesticated carnivorous mammal with soft fur, a short snout, and retractile claws, kept as a pet or for catching mice. (noun)",
        "alternateDefinition": "A wild animal of the cat family. (noun)",
        "letterCount": generateLetterCountDisplay("cat")
    },
    {
        "word": "light",
        "partOfSpeech": "adjective,noun,verb",
        "synonyms": ["bright", "shiny", "luminous"],
        "definition": "The natural agent that stimulates sight and makes things visible. (noun)",
        "alternateDefinition": "Having little weight; not heavy.",
        "letterCount": generateLetterCountDisplay("light")
    },
    {
        "word": "slow",
        "partOfSpeech": "adjective",
        "definition": "Moving or operating at a low speed; not quick or fast. (adjective)",
        "alternateDefinition": "To reduce one's speed or the speed of something. (verb)",
        "letterCount": generateLetterCountDisplay("slow")
    },
    {
        "word": "tree",
        "partOfSpeech": "noun",
        "definition": "A perennial plant with an elongated stem, or trunk, supporting branches and leaves. (noun)",
        "alternateDefinition": "To chase someone up a tree. (verb)",
        "letterCount": generateLetterCountDisplay("tree")
    },
    {
        "word": "strong",
        "partOfSpeech": "adjective",
        "synonyms": ["powerful", "mighty", "tough"],
        "definition": "Having great physical power and ability. (adjective)",
        "alternateDefinition": "Not easily disturbed, upset, or affected. (adjective)",
        "letterCount": generateLetterCountDisplay("strong")
    },
    {
        "word": "fast",
        "partOfSpeech": "adjective,adverb,verb",
        "definition": "Moving or capable of moving at high speed. (adjective)",
        "alternateDefinition": "To abstain from all or some kinds of food or drink, especially as a religious observance. (verb)",
        "letterCount": generateLetterCountDisplay("fast")
    },
    {
        "word": "kind",
        "partOfSpeech": "adjective,noun",
        "synonyms": ["caring", "nice", "compassionate"],
        "definition": "A group of people or things having similar characteristics. (noun)",
        "alternateDefinition": "Having or showing a friendly, generous, and considerate nature. (adjective)",
        "letterCount": generateLetterCountDisplay("kind")
    },
    {
        "word": "bright",
        "partOfSpeech": "adjective",
        "definition": "Emitting or reflecting a lot of light; shining. (adjective)",
        "alternateDefinition": "Intelligent and quick-witted. (adjective)",
        "letterCount": generateLetterCountDisplay("bright")
    },
    {
        "word": "deep",
        "partOfSpeech": "adjective,adverb,noun",
        "synonyms": ["profound", "low", "serious"],
        "definition": "Extending far down from the top or surface. (adjective)",
        "alternateDefinition": "Profound or intense in quality or emotion. (adjective)",
        "letterCount": generateLetterCountDisplay("deep")
    },
    {
        "word": "red",
        "partOfSpeech": "adjective",
        "definition": "Of a color at the end of the spectrum next to orange and opposite violet; resembling the color of blood. (adjective)",
        "alternateDefinition": "A color at the end of the spectrum next to orange and opposite violet. (noun)",
        "letterCount": generateLetterCountDisplay("red")
    },
    {
        "word": "book",
        "partOfSpeech": "noun,verb",
        "synonyms": ["tome", "volume", "publication"],
        "definition": "A written or printed work consisting of pages glued or sewn together along one side and bound in covers. (noun)",
        "alternateDefinition": "To reserve or arrange for someone to have a seat, room, etc. (verb)",
        "letterCount": generateLetterCountDisplay("book")
    },
    {
        "word": "water",
        "partOfSpeech": "noun,verb",
        "synonyms": ["liquid", "fluid", "aqua"],
        "definition": "A colorless, transparent, odorless liquid that forms the seas, lakes, rivers, and rain. (noun)",
        "alternateDefinition": "To pour or sprinkle water on a plant or area. (verb)",
        "letterCount": generateLetterCountDisplay("water")
    },
    {
        "word": "green",
        "partOfSpeech": "adjective,noun",
        "definition": "Of the color between blue and yellow in the spectrum, as of grass or emeralds. (adjective)",
        "alternateDefinition": "Inexperienced, naive, or gullible. (adjective)",
        "letterCount": generateLetterCountDisplay("green")
    },
    {
        "word": "talk",
        "partOfSpeech": "verb,noun",
        "synonyms": ["speak", "chat", "converse"],
        "definition": "To speak in order to give information or express ideas or feelings. (verb)",
        "alternateDefinition": "A conversation or discussion. (noun)",
        "letterCount": generateLetterCountDisplay("talk")
    },
    {
        "word": "world",
        "partOfSpeech": "noun",
        "definition": "The earth, together with all of its countries and peoples. (noun)",
        "alternateDefinition": "A particular region or group of countries. (noun)",
        "letterCount": generateLetterCountDisplay("world")
    },
    {
        "word": "play",
        "partOfSpeech": "verb,noun",
        "synonyms": ["frolic", "game", "recreation"],
        "definition": "To engage in activity for enjoyment and recreation rather than a serious or practical purpose. (verb)",
        "alternateDefinition": "A dramatic work for the stage or to be broadcast. (noun)",
        "letterCount": generateLetterCountDisplay("play")
    },
    {
        "word": "music",
        "partOfSpeech": "noun",
        "synonyms": ["melody", "harmony", "sound"],
        "definition": "Vocal or instrumental sounds combined in such a way as to produce beauty of form, harmony, and expression of emotion. (noun)",
        "alternateDefinition": "The art or science of composing or performing music. (noun)",
        "letterCount": generateLetterCountDisplay("music")
    },
    {
        "word": "time",
        "partOfSpeech": "noun,verb",
        "synonyms": ["period", "era", "age"],
        "definition": "The indefinite continued progress of existence and events in the past, present, and future regarded as a whole. (noun)",
        "alternateDefinition": "To measure the time taken by an event or person. (verb)",
        "letterCount": generateLetterCountDisplay("time")
    },
    {
        "word": "cloud",
        "partOfSpeech": "noun,verb",
        "synonyms": ["mist", "haze", "fog"],
        "definition": "A visible mass of condensed water vapor floating in the atmosphere. (noun)",
        "alternateDefinition": "To make or become less clear or transparent. (verb)",
        "letterCount": generateLetterCountDisplay("cloud")
    },
    {
        "word": "dream",
        "partOfSpeech": "noun,verb",
        "synonyms": ["vision", "fantasy", "imagination"],
        "definition": "A series of thoughts, images, and sensations occurring in a person's mind during sleep. (noun)",
        "alternateDefinition": "To experience dreams during sleep. (verb)",
        "letterCount": generateLetterCountDisplay("dream")
    },
    {
        "word": "fire",
        "partOfSpeech": "noun,verb",
        "synonyms": ["flame", "blaze", "inferno"],
        "definition": "Combustion or burning, in which substances combine chemically with oxygen from the air and typically give out bright light, heat, and smoke. (noun)",
        "alternateDefinition": "To discharge a gun or other weapon. (verb)",
        "letterCount": generateLetterCountDisplay("fire")
    },
    {
        "word": "glass",
        "partOfSpeech": "noun,verb",
        "synonyms": ["pane", "crystal", "goblet"],
        "definition": "A hard, brittle substance, typically transparent or translucent, made by fusing sand with soda, lime, and sometimes other ingredients and cooling rapidly. (noun)",
        "alternateDefinition": "To fit windows with glass. (verb)",
        "letterCount": generateLetterCountDisplay("glass")
    },
    {
        "word": "laugh",
        "partOfSpeech": "verb,noun",
        "synonyms": ["giggle", "chuckle", "snicker"],
        "definition": "To make the spontaneous sounds and movements of the face and body that are the instinctive expressions of lively amusement. (verb)",
        "alternateDefinition": "An act of laughing. (noun)",
        "letterCount": generateLetterCountDisplay("laugh")
    },
    {
        "word": "moon",
        "partOfSpeech": "noun,verb",
        "synonyms": ["satellite", "orb", "celestial body"],
        "definition": "The natural satellite of the earth, visible (chiefly at night) by reflected light from the sun. (noun)",
        "alternateDefinition": "To behave or move in a listless and aimless manner. (verb)",
        "letterCount": generateLetterCountDisplay("moon")
    },
    {
        "word": "night",
        "partOfSpeech": "noun",
        "synonyms": ["darkness", "evening", "twilight"],
        "definition": "The period of darkness in each twenty-four hours; the time from sunset to sunrise. (noun)",
        "alternateDefinition": "A period of time characterized by a particular quality. (noun)",
        "letterCount": generateLetterCountDisplay("night")
    },
    {
        "word": "ocean",
        "partOfSpeech": "noun",
        "synonyms": ["sea", "water", "deep"],
        "definition": "A very large expanse of sea, in particular, each of the main areas into which the sea is divided geographically. (noun)",
        "alternateDefinition": "A very large or unlimited space or quantity. (noun)",
        "letterCount": generateLetterCountDisplay("ocean")
    },
    {
        "word": "peace",
        "partOfSpeech": "noun",
        "synonyms": ["harmony", "tranquility", "calm"],
        "definition": "Freedom from disturbance; tranquility. (noun)",
        "alternateDefinition": "A state or period in which there is no war or a war has ended. (noun)",
        "letterCount": generateLetterCountDisplay("peace")
    },
    {
        "word": "river",
        "partOfSpeech": "noun",
        "synonyms": ["stream", "waterway", "brook"],
        "definition": "A large natural stream of water flowing in a channel to the sea, a lake, or another river. (noun)",
        "alternateDefinition": "A large quantity of a flowing substance. (noun)",
        "letterCount": generateLetterCountDisplay("river")
    },
    {
        "word": "star",
        "partOfSpeech": "noun,verb",
        "synonyms": ["celestial body", "luminary", "celebrity"],
        "definition": "A fixed luminous point in the night sky that is a large, remote incandescent body like the sun. (noun)",
        "alternateDefinition": "To feature as a principal performer. (verb)",
        "letterCount": generateLetterCountDisplay("star")
    },
    {
        "word": "sun",
        "partOfSpeech": "noun,verb",
        "synonyms": ["star", "daystar", "sol"],
        "definition": "The star around which the earth orbits. (noun)",
        "alternateDefinition": "To expose oneself to the sun. (verb)",
        "letterCount": generateLetterCountDisplay("sun")
    },
    {
        "word": "wind",
        "partOfSpeech": "noun,verb",
        "synonyms": ["breeze", "gust", "zephyr"],
        "definition": "The perceptible natural movement of the air, especially in the form of a current of air blowing from a particular direction. (noun)",
        "alternateDefinition": "To cause (someone) to have difficulty breathing. (verb)",
        "letterCount": generateLetterCountDisplay("wind")
    },
    {
        "word": "earth",
        "partOfSpeech": "noun,verb",
        "synonyms": ["soil", "ground", "land"],
        "definition": "The planet on which we live; the world. (noun)",
        "alternateDefinition": "To connect electrically with the ground. (verb)",
        "letterCount": generateLetterCountDisplay("earth")
    },
    {
        "word": "flower",
        "partOfSpeech": "noun,verb",
        "synonyms": ["blossom", "bloom", "petal"],
        "definition": "The seed-bearing part of a plant, consisting of reproductive organs that are typically surrounded by a brightly colored corolla (petals) and a green calyx (sepals). (noun)",
        "alternateDefinition": "To develop fully; mature. (verb)",
        "letterCount": generateLetterCountDisplay("flower")
    },
    {
        "word": "forest",
        "partOfSpeech": "noun,verb",
        "synonyms": ["woods", "jungle", "wilderness"],
        "definition": "A large area covered chiefly with trees and undergrowth. (noun)",
        "alternateDefinition": "To cover (an area of land) with forest; plant with trees. (verb)",
        "letterCount": generateLetterCountDisplay("forest")
    },
    {
        "word": "mountain",
        "partOfSpeech": "noun",
        "synonyms": ["peak", "summit", "ridge"],
        "definition": "A large natural elevation of the earth's surface rising abruptly from the surrounding level; a large steep hill. (noun)",
        "alternateDefinition": "A large amount or quantity of something. (noun)",
        "letterCount": generateLetterCountDisplay("mountain")
    },
    {
        "word": "valley",
        "partOfSpeech": "noun",
        "synonyms": ["gorge", "ravine", "dale"],
        "definition": "A low area of land between hills or mountains, typically with a river or stream flowing through it. (noun)",
        "alternateDefinition": "A long depression in the surface of the land that usually contains a river. (noun)",
        "letterCount": generateLetterCountDisplay("valley")
    },
    {
        "word": "desert",
        "partOfSpeech": "noun,verb",
        "synonyms": ["wasteland", "dune", "barren"],
        "definition": "A barren area of landscape where little precipitation occurs and consequently living conditions are hostile for plant and animal life. (noun)",
        "alternateDefinition": "To abandon (a person, cause, or organization) in a way considered disloyal or treacherous. (verb)",
        "letterCount": generateLetterCountDisplay("desert")
    },
    {
        "word": "island",
        "partOfSpeech": "noun",
        "synonyms": ["isle", "atoll", "archipelago"],
        "definition": "A piece of land surrounded by water. (noun)",
        "alternateDefinition": "A thing regarded as resembling an island, especially in being isolated, detached, or surrounded in some way. (noun)",
        "letterCount": generateLetterCountDisplay("island")
    },
    {
        "word": "jungle",
        "partOfSpeech": "noun",
        "synonyms": ["rainforest", "wilderness", "thicket"],
        "definition": "An area of land overgrown with dense forest and tangled vegetation, typically in the tropics. (noun)",
        "alternateDefinition": "A situation or place of bewildering complexity or brutal competitiveness. (noun)",
        "letterCount": generateLetterCountDisplay("jungle")
    },
    {
        "word": "lake",
        "partOfSpeech": "noun",
        "synonyms": ["pond", "reservoir", "lagoon"],
        "definition": "A large body of water surrounded by land. (noun)",
        "alternateDefinition": "A pool of liquid. (noun)",
        "letterCount": generateLetterCountDisplay("lake")
    },
    {
        "word": "volcano",
        "partOfSpeech": "noun",
        "synonyms": ["mountain", "crater", "vent"],
        "definition": "A mountain or hill, typically conical, having a crater or vent through which lava, rock fragments, hot vapor, and gas are or have been erupted from the earth's crust. (noun)",
        "alternateDefinition": "A situation that is likely to become dangerous or violent. (noun)",
        "letterCount": generateLetterCountDisplay("volcano")
    }
];
// Update all words with letter count
words.forEach(word => {
    if (!word.letterCount) {
        word.letterCount = generateLetterCountDisplay(word.word);
    }
});
export function getRandomWord() {
    const randomIndex = Math.floor(Math.random() * words.length);
    return words[randomIndex];
}
