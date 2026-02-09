import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Linking, StyleSheet } from "react-native";
import { Minus, Plus } from "lucide-react-native";
import { colors, spacing, typography } from "../theme";
import { getSchedule, setSchedule } from "../database/db";
import {
  scheduleWeeklyReminders,
  getNotificationPermissionStatus,
} from "../utils/notifications";
import SystemCard from "./SystemCard";

const DAY_LABELS = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];

export default function ScheduleManager() {
  const [activeDays, setActiveDays] = useState<Set<number>>(new Set());
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    const entries = getSchedule();
    if (entries.length > 0) {
      setActiveDays(new Set(entries.map(e => e.dayOfWeek)));
      setHour(entries[0].reminderHour);
      setMinute(entries[0].reminderMinute);
    }

    getNotificationPermissionStatus().then(status => {
      setPermissionDenied(status === "denied");
    });
  }, []);

  const persist = async (days: Set<number>, h: number, m: number) => {
    const dayArray = Array.from(days).sort();
    setSchedule(dayArray, h, m);
    await scheduleWeeklyReminders(dayArray, h, m);

    const status = await getNotificationPermissionStatus();
    setPermissionDenied(status === "denied");
  };

  const toggleDay = (day: number) => {
    const next = new Set(activeDays);
    if (next.has(day)) {
      next.delete(day);
    } else {
      next.add(day);
    }
    setActiveDays(next);
    persist(next, hour, minute);
  };

  const adjustHour = (delta: number) => {
    const next = (hour + delta + 24) % 24;
    setHour(next);
    persist(activeDays, next, minute);
  };

  const adjustMinute = (delta: number) => {
    const next = (minute + delta + 60) % 60;
    setMinute(next);
    persist(activeDays, hour, next);
  };

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <SystemCard style={styles.card}>
      <Text style={styles.header}>RAPPELS</Text>

      <View style={styles.daysRow}>
        {DAY_LABELS.map((label, i) => {
          const active = activeDays.has(i);
          return (
            <Pressable
              key={i}
              onPress={() => toggleDay(i)}
              style={[styles.dayBtn, active && styles.dayBtnActive]}
            >
              <Text style={[styles.dayLabel, active && styles.dayLabelActive]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {activeDays.size > 0 && (
        <View style={styles.timeRow}>
          <View style={styles.timeUnit}>
            <Pressable onPress={() => adjustHour(1)} style={styles.timeBtn}>
              <Plus size={14} color={colors.textPrimary} />
            </Pressable>
            <Text style={styles.timeValue}>{pad(hour)}</Text>
            <Pressable onPress={() => adjustHour(-1)} style={styles.timeBtn}>
              <Minus size={14} color={colors.textPrimary} />
            </Pressable>
          </View>

          <Text style={styles.timeSeparator}>:</Text>

          <View style={styles.timeUnit}>
            <Pressable onPress={() => adjustMinute(5)} style={styles.timeBtn}>
              <Plus size={14} color={colors.textPrimary} />
            </Pressable>
            <Text style={styles.timeValue}>{pad(minute)}</Text>
            <Pressable onPress={() => adjustMinute(-5)} style={styles.timeBtn}>
              <Minus size={14} color={colors.textPrimary} />
            </Pressable>
          </View>
        </View>
      )}

      {permissionDenied && activeDays.size > 0 && (
        <Pressable
          onPress={() => Linking.openSettings()}
          style={styles.deniedRow}
        >
          <Text style={styles.deniedText}>
            Notifications désactivées —{" "}
            <Text style={styles.deniedLink}>Ouvrir les réglages</Text>
          </Text>
        </Pressable>
      )}
    </SystemCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    ...typography.heading,
    color: colors.textSecondary,
    marginBottom: spacing.sm + 4,
  },
  daysRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  dayBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    backgroundColor: colors.bgTertiary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayBtnActive: {
    backgroundColor: colors.accentBlue,
    borderColor: colors.accentBlue,
  },
  dayLabel: {
    fontFamily: "Rajdhani_600SemiBold",
    fontSize: 13,
    color: colors.textMuted,
    textTransform: "uppercase",
  },
  dayLabelActive: {
    color: colors.bgPrimary,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  timeUnit: {
    alignItems: "center",
    gap: spacing.xs,
  },
  timeBtn: {
    width: 36,
    height: 28,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  timeValue: {
    ...typography.mono,
    fontSize: 24,
    color: colors.textPrimary,
  },
  timeSeparator: {
    ...typography.mono,
    fontSize: 24,
    color: colors.textSecondary,
    marginTop: 28,
  },
  deniedRow: {
    marginTop: spacing.sm + 4,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  deniedText: {
    ...typography.monoSm,
    color: colors.accentRed,
  },
  deniedLink: {
    color: colors.accentBlue,
    textDecorationLine: "underline",
  },
});
