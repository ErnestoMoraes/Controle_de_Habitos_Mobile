import { useEffect, useState } from "react";
import { generateProgressPercentage } from "../utils/generate-progress-percentage";
import { Alert, ScrollView, Text, View } from "react-native";
import { useRoute } from '@react-navigation/native';
import { BackButton } from "../components/BackButton";
import { ProgressBar } from "../components/ProgressBar";
import { Checkbox } from "../components/CheckBox";
import { Loading } from "../components/Loading";
import { HabitEmpty } from "../components/HabitEmpty";
import { api } from "../lib/axios";
import dayjs from "dayjs";
import clsx from "clsx";


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
    const isDateInPast = parsedDate.endOf('day').isBefore(new Date());
    const dayOfWeek = parsedDate.format('dddd');
    const dayAndMonth = parsedDate.format('DD/MM');
    const habitsProgress = dayInfo?.possibleHabits.length
        ? generateProgressPercentage(dayInfo.possibleHabits.length, completedHabits.length)
        : 0;
    async function featchHabits() {
        try {
            console.log('Featch');
            setLoading(true);
            const response = await api.get('/day', { params: { date } });
            setDayInfo(response.data);

            console.log(date);
            console.log(response.data);

            setCompletedHabits(response.data.completedHabits!);
        } catch (error) {
            console.log(error);
            Alert.alert('onPress', 'Não foi posivel carregar as infos dos hábitos.');
        } finally {
            setLoading(false);
        }
    }
    
    async function handleToggleHabit(habitID: string) {
        try {
            console.log('Toggle');

            await api.patch(`/habits/${habitID}/toggle`);

            if (completedHabits?.includes(habitID)) {
                setCompletedHabits(prevState => prevState.filter(habit => habit !== habitID));

                console.log('Toggle Desabilitar!');
            } else {
                setCompletedHabits(prevState => [...prevState, habitID]);

                console.log('Toggle Habilitado!');
            }
        } catch (error) {
            console.log(error);
            Alert.alert('Ops', 'Não foi possivel atualizar o status do hábito.');
        }
    }

    useEffect(() => {
        featchHabits();
    }, []);

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

                <View className={clsx("mt-6", {
                    ['opacity-50']: isDateInPast
                })}>
                    {
                        
                        dayInfo?.possibleHabits ?
                            dayInfo.possibleHabits?.map(habit => (
                                <Checkbox
                                    key={habit.id}
                                    title={habit.title}
                                    checked={completedHabits!.includes(habit.id)}
                                    onPress={() => handleToggleHabit(habit.id)}
                                    disabled={isDateInPast}
                                />
                            ))
                            :
                            <HabitEmpty />
                    }
                </View>

                {
                    isDateInPast && (
                        <Text className="text-white mt-10 text-center">
                            Você não pode editar hábitos de uma data passada.
                        </Text>
                    )
                }
            </ScrollView>
        </View>
    )
}