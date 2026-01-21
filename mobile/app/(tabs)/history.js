import { View, Text, FlatList, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { getStoryHistory } from '../../lib/api';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function History() {
    const router = useRouter();
    const [stories, setStories] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadHistory = async () => {
        try {
            setRefreshing(true);
            const data = await getStoryHistory();
            setStories(data.stories);
        } catch (err) {
            console.error(err);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadHistory();
    }, []);

    const renderItem = ({ item }) => (
        <Pressable
            onPress={() => router.push({ pathname: "/story/[id]", params: { id: item.id } })}
            className="bg-white p-4 mb-3 rounded-xl shadow-sm border border-gray-100"
        >
            <View className="flex-row justify-between items-start mb-2">
                <Text className="text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-600">{item.universe}</Text>
                <Text className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
            <Text className="font-bold text-gray-800 text-lg mb-1" numberOfLines={2}>{item.what_if}</Text>
            <Text className="text-sm text-gray-500">{item.word_count} words • ⭐ {item.average_rating || '-'}</Text>
        </Pressable>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="px-4 py-4">
                <Text className="text-2xl font-bold text-gray-900 mb-4">Your Library 📚</Text>
            </View>
            <FlatList
                data={stories}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={loadHistory} tintColor="#9333ea" />
                }
                ListEmptyComponent={
                    <View className="items-center justify-center py-20">
                        <Text className="text-gray-400 text-lg">No stories yet.</Text>
                        <Text className="text-gray-400 text-sm mt-2">Create your first story!</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}
