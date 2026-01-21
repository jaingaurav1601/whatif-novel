import { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { getUniverses, generateStory, generateCustomStory, generateSystemPrompt } from '../../lib/api';

const universeEmojis = {
    'Harry Potter': '🪄',
    'Lord of the Rings': '💍',
    'Marvel MCU': '🦸',
    'Star Wars': '⚡',
    'One Piece': '🏴‍☠️',
    'Naruto': '🌀',
    'Attack on Titan': '⚔️',
    'DC': '🦇'
};

export default function Home() {
    const router = useRouter();
    const [universes, setUniverses] = useState([]);
    const [selectedUniverse, setSelectedUniverse] = useState('');
    const [isCustomUniverse, setIsCustomUniverse] = useState(false);
    const [customUniverseName, setCustomUniverseName] = useState('');
    const [whatIf, setWhatIf] = useState('');
    const [length, setLength] = useState('medium');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getUniverses()
            .then(data => {
                setUniverses(data.universes);
                if (data.universes.length > 0) setSelectedUniverse(data.universes[0]);
            })
            .catch(err => console.error("Failed to load universes", err));
    }, []);

    const handleGenerate = async () => {
        if (!whatIf.trim()) {
            Alert.alert("Input Required", "Please enter a 'What If' scenario.");
            return;
        }

        if (isCustomUniverse && !customUniverseName.trim()) {
            Alert.alert("Input Required", "Please enter a custom universe name.");
            return;
        }

        setLoading(true);
        try {
            let result;
            if (isCustomUniverse) {
                // Auto-generate prompt logic similar to web
                const promptRes = await generateSystemPrompt(customUniverseName);
                result = await generateCustomStory(customUniverseName, promptRes.system_prompt, whatIf, length);
            } else {
                result = await generateStory(selectedUniverse, whatIf, length);
            }

            // Navigate to story view with the result object
            // We'll pass the result ID and fetch it there, or pass params
            // Passing ID is safer/cleaner
            router.push({ pathname: "/story/[id]", params: { id: result.id } });

        } catch (err) {
            Alert.alert("Error", "Failed to generate story. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar style="auto" />
            <ScrollView className="flex-1 px-4 py-6" contentContainerStyle={{ paddingBottom: 40 }}>
                <Text className="text-3xl font-bold text-center text-purple-600 mb-2">✨ What If Novel</Text>
                <Text className="text-center text-gray-500 mb-8">Reimagine Reality with AI</Text>

                {/* Universe Selection */}
                <Text className="text-lg font-bold text-gray-800 mb-3">Choose Universe</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                    <View className="flex-row gap-3">
                        {universes.map(u => (
                            <Pressable
                                key={u}
                                onPress={() => { setSelectedUniverse(u); setIsCustomUniverse(false); }}
                                className={`px-4 py-3 rounded-xl border-2 ${!isCustomUniverse && selectedUniverse === u ? 'bg-purple-600 border-purple-600' : 'bg-white border-gray-200'}`}
                            >
                                <Text className={`font-medium ${!isCustomUniverse && selectedUniverse === u ? 'text-white' : 'text-gray-700'}`}>
                                    {universeEmojis[u]} {u}
                                </Text>
                            </Pressable>
                        ))}
                        <Pressable
                            onPress={() => setIsCustomUniverse(true)}
                            className={`px-4 py-3 rounded-xl border-2 ${isCustomUniverse ? 'bg-pink-500 border-pink-500' : 'bg-white border-gray-200'}`}
                        >
                            <Text className={`font-medium ${isCustomUniverse ? 'text-white' : 'text-gray-700'}`}>
                                ✨ Custom
                            </Text>
                        </Pressable>
                    </View>
                </ScrollView>

                {/* Custom Inputs */}
                {isCustomUniverse && (
                    <View className="mb-6 animate-pulse">
                        <Text className="text-sm font-bold text-gray-700 mb-2">Custom Universe Name</Text>
                        <TextInput
                            value={customUniverseName}
                            onChangeText={setCustomUniverseName}
                            placeholder="e.g. Cyberpunk 2077"
                            className="w-full bg-white p-4 rounded-xl border border-gray-200 text-base"
                        />
                    </View>
                )}

                {/* What If Input */}
                <Text className="text-lg font-bold text-gray-800 mb-3">What If Scenario</Text>
                <TextInput
                    value={whatIf}
                    onChangeText={setWhatIf}
                    placeholder="What if Harry was in Slytherin?"
                    multiline
                    numberOfLines={4}
                    className="w-full bg-white p-4 rounded-xl border border-gray-200 text-base min-h-[120px] mb-6"
                    textAlignVertical="top"
                />

                {/* Length Selection */}
                <Text className="text-lg font-bold text-gray-800 mb-3">Length</Text>
                <View className="flex-row gap-3 mb-8">
                    {['short', 'medium', 'long'].map(l => (
                        <Pressable
                            key={l}
                            onPress={() => setLength(l)}
                            className={`flex-1 py-3 rounded-xl border-2 items-center ${length === l ? 'bg-blue-100 border-blue-500' : 'bg-white border-gray-200'}`}
                        >
                            <Text className={`font-medium capitalize ${length === l ? 'text-blue-700' : 'text-gray-600'}`}>
                                {l}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                {/* Generate Button */}
                <Pressable
                    onPress={handleGenerate}
                    disabled={loading}
                    className={`w-full py-5 rounded-2xl shadow-lg items-center ${loading ? 'bg-purple-400' : 'bg-purple-600 active:bg-purple-700'}`}
                >
                    {loading ? (
                        <View className="flex-row items-center gap-2">
                            <ActivityIndicator color="white" />
                            <Text className="text-white font-bold text-lg">Weaving Story...</Text>
                        </View>
                    ) : (
                        <Text className="text-white font-bold text-lg">✨ Generate Story</Text>
                    )}
                </Pressable>

            </ScrollView>
        </SafeAreaView>
    );
}
