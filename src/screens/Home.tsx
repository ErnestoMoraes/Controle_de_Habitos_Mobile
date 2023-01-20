import { useNavigation } from "@react-navigation/native";
import { View, Text, ScrollView, Alert } from "react-native";
import { DAY_SIZE, HabitDay } from "../components/HabitDay";
import { Header } from "../components/Header";
import { generateRangeDatesFromYearStart } from '../utils/generate-range-between-dates';
import { api } from '../lib/axios';
import { useEffect, useState } from "react";


const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const datesFromYearsStart = generateRangeDatesFromYearStart();
const minSummaryDateSizes = 18 * 7;
const amountOfDaysToFill = minSummaryDateSizes - datesFromYearsStart.length;

export function Home() {
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);
    const { navigate } = useNavigation();

    async function fetchData() {
        try {
            console.log('Entrou!');
            setLoading(true);
            const response = await api.get('/summary');
            console.log(`Dados: ${response.data}`);
            setSummary(response.data);
            console.log('Saiu!')
        } catch (error) {
            Alert.alert('Ops', 'Não foi possivel carregar o sumário de hábtios.')
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { 
        fetchData();
     }, []);

    return (
        <View className="flex-1 bg-background px-8 pt-16" >
            <Header />
            <View className="flex-row mt-6 mb-3">
                {
                    weekDays.map((weekDay, i) => (
                        <Text key={`${weekDay}-${i}`}
                            className="text-zinc-400 text-xl font-bold text-center mx-1"
                            style={{ width: DAY_SIZE }}
                        >
                            {weekDay}
                        </Text>
                    ))
                }
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                <View
                    className="flex-row flex-wrap"
                >
                    {
                        datesFromYearsStart.map(date => (
                            <HabitDay
                                key={date.toISOString()}
                                onPress={() => navigate('habit', { date: date.toISOString() })}
                            />
                        ))
                    }
                    {
                        amountOfDaysToFill > 0 && Array
                            .from({ length: amountOfDaysToFill })
                            .map((_, index) => (
                                <View
                                    key={index}
                                    className="bg-zinc-900 rounded-lg border-2 m-1 border-zinc-800 opacity-40"
                                    style={{ width: DAY_SIZE, height: DAY_SIZE }}
                                />
                            ))
                    }
                </View>
            </ScrollView>

        </View>
    )
}