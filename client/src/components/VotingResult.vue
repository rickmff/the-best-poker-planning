<template>
    <div class="mt-8 bg-secondary rounded-lg p-4">
        <h2 class="text-2xl font-semibold mb-4">Voting Results</h2>
        <div class="flex justify-center">
            <svg width="200" height="200" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="transparent" stroke="#23252A" stroke-width="10" />
                <template v-for="(slice, index) in pieSlices" :key="index">
                    <path :d="slice.path" :fill="slice.color" />
                </template>
            </svg>
        </div>
        <div class="mt-4 flex flex-wrap justify-center">
            <div v-for="(count, vote) in votes" :key="vote" class="flex items-center mr-4 mb-2">
                <div :style="{ backgroundColor: getColor(vote) }" class="w-4 h-4 mr-2"></div>
                <span>{{ vote }}: {{ count }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    votes: Record<string, number>;
    voteOptions: string[];
}>();

const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56'];

const getColor = (vote: string) => {
    const index = props.voteOptions.indexOf(vote);
    return colors[index % colors.length];
};

const totalVotes = computed(() => Object.values(props.votes).reduce((sum, count) => sum + count, 0));

const pieSlices = computed(() => {
    let startAngle = 0;
    return Object.entries(props.votes).map(([vote, count], index) => {
        const sliceAngle = (count / totalVotes.value) * 360;
        const endAngle = startAngle + sliceAngle;
        const largeArcFlag = sliceAngle > 180 ? 1 : 0;
        
        const startX = 50 + 45 * Math.cos((startAngle * Math.PI) / 180);
        const startY = 50 + 45 * Math.sin((startAngle * Math.PI) / 180);
        const endX = 50 + 45 * Math.cos((endAngle * Math.PI) / 180);
        const endY = 50 + 45 * Math.sin((endAngle * Math.PI) / 180);

        const path = `M 50 50 L ${startX} ${startY} A 45 45 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
        
        startAngle = endAngle;
        
        return {
            path,
            color: getColor(vote)
        };
    });
});
</script>