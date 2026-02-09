import React, { useCallback, useState, useRef, useEffect } from "react";
import { Text, View, StyleSheet, Alert, Animated } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getWorkoutHistory, deleteWorkoutSession } from "../database/db";
import type { WorkoutSession } from "../types";
import { format } from "date-fns";
import { colors, spacing, typography } from "../theme";
import SystemCard from "../components/SystemCard";
import SystemButton from "../components/SystemButton";

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
  const translateX = useRef(new Animated.Value(-8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        delay: index * 60,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration: 200,
        delay: index * 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateX }] }}>
      <SystemCard style={styles.sessionCard}>
        <Text style={styles.date}>
          {format(new Date(item.date), "PPP").toUpperCase()}
        </Text>
        <View style={styles.statsRow}>
          <View>
            <Text style={styles.statLabel}>ROUNDS</Text>
            <Text style={styles.statValue}>{item.totalRounds}</Text>
          </View>
          <View>
            <Text style={styles.statLabel}>VOLUME</Text>
            <Text style={styles.statValue}>{item.totalVolume}</Text>
          </View>
        </View>
        <SystemButton
          title="Delete"
          onPress={() => onDelete(item.id)}
          variant="destructive"
          style={{ marginTop: spacing.sm }}
        />
      </SystemCard>
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
    Alert.alert("CONFIRM DELETION", "This session will be permanently erased.", [
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
      {sessions.length === 0 && (
        <Text style={styles.emptyText}>NO RECORDS FOUND</Text>
      )}
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
    backgroundColor: colors.bgPrimary,
  },
  list: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.xxl,
  },
  sessionCard: {
    marginBottom: spacing.sm + 4,
  },
  date: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.xl,
  },
  statLabel: {
    ...typography.monoSm,
    color: colors.textMuted,
    textTransform: "uppercase",
  },
  statValue: {
    ...typography.displayMd,
    color: colors.textPrimary,
  },
});
