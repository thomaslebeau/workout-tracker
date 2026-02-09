import React, { useCallback, useRef, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  Pressable,
  Animated,
  ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { LineChart } from "react-native-gifted-charts";
import { getVolumeStats, VolumeFilter, VolumeStats } from "../database/db";
import { colors, spacing, typography } from "../theme";
import SystemCard from "../components/SystemCard";

const FILTERS: { key: VolumeFilter; label: string }[] = [
  { key: "day", label: "DAY" },
  { key: "week", label: "WEEK" },
  { key: "year", label: "YEAR" },
];

export default function StatsScreen() {
  const [filter, setFilter] = useState<VolumeFilter>("week");
  const [stats, setStats] = useState<VolumeStats | null>(null);

  const chartOpacity = useRef(new Animated.Value(0)).current;
  const chartTranslateX = useRef(new Animated.Value(-8)).current;
  const summaryOpacity = useRef(new Animated.Value(0)).current;
  const summaryTranslateX = useRef(new Animated.Value(-8)).current;

  const loadStats = useCallback(() => {
    const data = getVolumeStats(filter);
    setStats(data);
  }, [filter]);

  useFocusEffect(
    useCallback(() => {
      loadStats();

      chartOpacity.setValue(0);
      chartTranslateX.setValue(-8);
      summaryOpacity.setValue(0);
      summaryTranslateX.setValue(-8);

      Animated.parallel([
        Animated.timing(chartOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(chartTranslateX, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();

      Animated.parallel([
        Animated.timing(summaryOpacity, {
          toValue: 1,
          duration: 200,
          delay: 100,
          useNativeDriver: false,
        }),
        Animated.timing(summaryTranslateX, {
          toValue: 0,
          duration: 200,
          delay: 100,
          useNativeDriver: false,
        }),
      ]).start();
    }, [filter])
  );

  const handleFilterChange = (newFilter: VolumeFilter) => {
    setFilter(newFilter);
  };

  const chartData =
    stats?.dataPoints.map((dp) => ({
      value: dp.value,
      label: dp.label,
      labelTextStyle: {
        color: colors.textMuted,
        fontFamily: "ShareTechMono_400Regular",
        fontSize: 10,
      },
    })) ?? [];

  const hasData = chartData.length > 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <Pressable
            key={f.key}
            onPress={() => handleFilterChange(f.key)}
            style={[
              styles.filterButton,
              filter === f.key && styles.filterButtonActive,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                filter === f.key && styles.filterTextActive,
              ]}
            >
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Animated.View
        style={{
          opacity: chartOpacity,
          transform: [{ translateX: chartTranslateX }],
        }}
      >
        <SystemCard style={styles.chartCard}>
          <Text style={styles.cardLabel}>VOLUME OVER TIME</Text>
          {hasData ? (
            <View style={styles.chartWrapper}>
              <LineChart
                areaChart
                curved
                data={chartData}
                height={180}
                noOfSections={4}
                spacing={
                  chartData.length > 1
                    ? Math.max(40, 280 / chartData.length)
                    : 280
                }
                initialSpacing={16}
                endSpacing={16}
                color={colors.accentBlue}
                thickness={2}
                startFillColor={colors.accentBlue}
                endFillColor={colors.accentBlue}
                startOpacity={0.2}
                endOpacity={0}
                hideDataPoints={false}
                dataPointsColor={colors.accentBlue}
                dataPointsRadius={4}
                xAxisColor={colors.border}
                yAxisColor={colors.border}
                yAxisTextStyle={{
                  color: colors.textMuted,
                  fontFamily: "ShareTechMono_400Regular",
                  fontSize: 10,
                }}
                rulesColor={colors.border}
                rulesType="dashed"
                dashWidth={4}
                dashGap={4}
                backgroundColor={colors.bgTertiary}
                xAxisLabelTextStyle={{
                  color: colors.textMuted,
                  fontFamily: "ShareTechMono_400Regular",
                  fontSize: 10,
                }}
                rotateLabel={chartData.length > 8}
              />
            </View>
          ) : (
            <View style={styles.emptyChart}>
              <Text style={styles.emptyText}>NO DATA RECORDED</Text>
              <Text style={styles.emptySubtext}>
                Complete a workout to see your stats
              </Text>
            </View>
          )}
        </SystemCard>
      </Animated.View>

      <Animated.View
        style={{
          opacity: summaryOpacity,
          transform: [{ translateX: summaryTranslateX }],
        }}
      >
        <SystemCard style={styles.summaryCard}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>TOTAL SESSIONS</Text>
            <Text style={styles.statValue}>{stats?.totalSessions ?? 0}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>AVG VOLUME</Text>
            <Text style={styles.statValue}>{stats?.avgVolume ?? 0}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>BEST SESSION</Text>
            <Text style={styles.statValue}>{stats?.bestSession ?? 0}</Text>
          </View>
        </SystemCard>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  content: {
    padding: spacing.md,
  },
  filterRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: colors.accentBlue,
    borderColor: colors.accentBlue,
  },
  filterText: {
    ...typography.monoSm,
    color: colors.textMuted,
  },
  filterTextActive: {
    color: colors.bgPrimary,
  },
  chartCard: {
    marginBottom: spacing.md,
  },
  cardLabel: {
    ...typography.monoSm,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  chartWrapper: {
    marginLeft: -spacing.md,
    marginRight: -spacing.md,
    overflow: "hidden",
  },
  emptyChart: {
    height: 180,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
  },
  emptySubtext: {
    ...typography.monoSm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  summaryCard: {
    marginBottom: spacing.md,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  statLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  statValue: {
    ...typography.mono,
    color: colors.textPrimary,
    textAlign: "right",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
});
