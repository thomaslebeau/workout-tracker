import React, { useCallback, useState, useRef, useEffect } from "react";
import { Text, StyleSheet, Button, Alert, Animated } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getWorkoutHistory, deleteWorkoutSession } from "../database/db";
import type { WorkoutSession } from "../types";
import { format } from "date-fns";

function AnimatedSessionCard({
  item,
  index,
  onDelete,
}: {
  item: WorkoutSession;
  index: number;
  onDelete: (id: string) => void;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        delay: index * 80,
        useNativeDriver: true,
        damping: 15,
        stiffness: 120,
        mass: 1,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.sessionCard,
        { opacity, transform: [{ translateY }] },
      ]}
    >
      <Text style={styles.date}>{format(new Date(item.date), "PPP")}</Text>
      <Animated.View style={styles.statsRow}>
        <Text style={styles.stat}>Rounds: {item.totalRounds}</Text>
        <Text style={styles.stat}>Total Volume: {item.totalVolume} reps</Text>
      </Animated.View>
      <Button
        title="Delete"
        onPress={() => onDelete(item.id)}
        color="red"
      />
    </Animated.View>
  );
}

export default function HistoryScreen() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
      setRefreshKey((k) => k + 1);
    }, [])
  );

  const loadHistory = () => {
    const history = getWorkoutHistory();
    setSessions(history);
  };

  const handleDelete = (sessionId: string) => {
    Alert.alert("Delete session", "Are you sure you want to delete this workout session?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteWorkoutSession(sessionId);
          loadHistory();
          setRefreshKey((k) => k + 1);
        },
      },
    ]);
  };

  return (
    <Animated.ScrollView
      style={styles.container}
      contentContainerStyle={styles.list}
    >
      {sessions.map((item, index) => (
        <AnimatedSessionCard
          key={`${item.id}-${refreshKey}`}
          item={item}
          index={index}
          onDelete={handleDelete}
        />
      ))}
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  list: {
    padding: 20,
  },
  sessionCard: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  date: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stat: {
    fontSize: 14,
    color: "#666",
  },
});
