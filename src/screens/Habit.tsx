import { useEffect, useState } from "react";
import { generateProgressPercentage } from "../utils/generate-progress-percentage"; 
import { Alert, ScrollView, Text, View } from "react-native";
import { useRoute } from '@react-navigation/native';
import { BackButton } from "../components/BackButton";
import { ProgressBar } from "../components/ProgressBar";
import { Checkbox } from "../components/CheckBox";
import { Loading } from "../components/Loading";
import { api } from "../lib/axios";
import dayjs from "dayjs";


interface Params {
    date: string;
}

interface DayInfoProps {
    completedHabits: string[];
    possibleHabits: {
        id: string;
        title: string;
    }[];
}

export function Habit() {
    const [loading, setLoading] = useState(true);
    const [dayInfo, setDayInfo] = useState<DayInfoProps | null>(null);
    const [completedHabits, setCompletedHabits] = useState<string[]>([]);
    const route = useRoute();
    const { date } = route.params as Params;
    const parsedDate = dayjs(date);
    const dayOfWeek = parsedDate.format('dddd');
    const dayAndMonth = parsedDate.format('DD/MM');
    const habitsProgress = dayInfo?.possibleHabits.length 
    ? generateProgressPercentage(dayInfo.possibleHabits.length, completedHabits.length) 
    : 0;
    async function featchHabits() {
        try {
            setLoading(true);
            const response = await api.get('/day', { params: { date: date } });
            setDayInfo(response.data);
            setCompletedHabits(response.data.completedHabits);
        } catch (error) {
            console.log(error);
            Alert.alert('onPress', 'Não foi posivel carregar as infos dos hábitos.');
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        featchHabits()
    }, []);

    async function handleToggleHabit(habitID: string) {
        if(completedHabits.includes(habitID)) {
            setCompletedHabits(prevState => prevState.filter(habit => habit !== habitID));
        } else {
            setCompletedHabits(prevState => [...prevState, habitID]);
        }
    }

    if (loading) {
        return (
            <Loading />
        );
    }
    return (
        <View className="flex-1 bg-background px-8 pt-16">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                <BackButton />
                <Text className="mt-6 text-zinc-400 font-semibold text-base lowercase">
                    {dayOfWeek}
                </Text>
                <Text className="text-white font-extrabold text-3xl">
                    {dayAndMonth}
                </Text>
                <ProgressBar progress={habitsProgress} />
                <View className="mt-6">
                    {dayInfo?.possibleHabits &&
                        dayInfo?.possibleHabits.map(habit =>

                            <Checkbox
                                key={habit.id}
                                title={habit.title}
                                checked={completedHabits.includes(habit.id)}
                                onPress={() => handleToggleHabit(habit.id)}
                            />
                        )
                    }
                </View>
            </ScrollView>
        </View>
    )
}