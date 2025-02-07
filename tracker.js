document.addEventListener("DOMContentLoaded", () => {
    const themeToggleButton = document.createElement("button");
    themeToggleButton.id = "theme-toggle";
    themeToggleButton.textContent = "Switch to Dark Mode";
    document.querySelector("header").appendChild(themeToggleButton);

    const body = document.body;

    // Check localStorage for theme preference
    const savedTheme = localStorage.getItem("theme") || "light";
    body.setAttribute("data-theme", savedTheme);
    updateToggleButtonText(savedTheme);

    // Toggle theme
    themeToggleButton.addEventListener("click", () => {
        const currentTheme = body.getAttribute("data-theme");
        const newTheme = currentTheme === "light" ? "dark" : "light";
        body.setAttribute("data-theme", newTheme);

        // Save to localStorage
        localStorage.setItem("theme", newTheme);
        updateToggleButtonText(newTheme);
    });

    function updateToggleButtonText(theme) {
        themeToggleButton.textContent =
            theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode";
    }
});





document.addEventListener("DOMContentLoaded", () => {
    const activityForm = document.getElementById("activity-form");
    const dailyPieChartCanvas = document.getElementById("dailyPieChart").getContext("2d");
    const dailyBarChartCanvas = document.getElementById("dailyBarChart").getContext("2d");
    const weeklyPieChartCanvas = document.getElementById("weeklyPieChart").getContext("2d");
    const weeklyBarChartCanvas = document.getElementById("weeklyBarChart").getContext("2d");
    const monthlyPieChartCanvas = document.getElementById("monthlyPieChart").getContext("2d");
    const monthlyBarChartCanvas = document.getElementById("monthlyBarChart").getContext("2d");
    const yearlyPieChartCanvas = document.getElementById("yearlyPieChart").getContext("2d");
    const yearlyBarChartCanvas = document.getElementById("yearlyBarChart").getContext("2d");

    const dailyDateSpan = document.getElementById("daily-date");
    const weekStartSpan = document.getElementById("week-start");
    const weekEndSpan = document.getElementById("week-end");
    const monthStartSpan = document.getElementById("month-start");
    const monthEndSpan = document.getElementById("month-end");
    const printWeeklyButton = document.getElementById("print-weekly");

    const dateInput = document.getElementById("date");

    let activities = JSON.parse(localStorage.getItem("activities")) || [];

    // Set the date input to the current date (India Standard Time)
    const today = new Date();
    today.setHours(today.getHours() + 5); // Adding 5 hours
    today.setMinutes(today.getMinutes() + 30); // Adding 30 minutes for IST
    const formattedToday = formatDate(today);
    dateInput.value = formattedToday;

    // Add activity
    activityForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const activity = e.target.activity.value;
        const duration = parseInt(e.target.duration.value);
        const date = e.target.date.value;

        activities.push({ activity, duration, date });
        localStorage.setItem("activities", JSON.stringify(activities));

        e.target.reset();
        dateInput.value = formattedToday;
        updateCharts();
    });

    // Update charts
    function updateCharts() {
        updateDailyChart();
        updateWeeklyChart();
        updateMonthlyChart();
        updateYearlyChart();
    }

    // Create Pie and Bar Chart
    function createCharts(contextPie, contextBar, title, data) {
        new Chart(contextPie, {
            type: "pie",
            data: {
                labels: Object.keys(data),
                datasets: [
                    {
                        label: title,
                        data: Object.values(data),
                        backgroundColor: [
                            "#ff6384",
                            "#36a2eb",
                            "#ffce56",
                            "#4bc0c0",
                            "#9966ff",
                            "#ff9f40",
                            "#c9cbcf",
                        ],
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: "top",
                    },
                    datalabels: {
                        formatter: (value, ctx) => {
                            const total = ctx.chart.data.datasets[0].data.reduce(
                                (a, b) => a + b,
                                0
                            );
                            return ((value / total) * 100).toFixed(2) + "%";
                        },
                        color: "#fff",
                        font: {
                            weight: "bold",
                        },
                    },
                },
            },
            plugins: [ChartDataLabels],
        });

        new Chart(contextBar, {
            type: "bar",
            data: {
                labels: Object.keys(data),
                datasets: [
                    {
                        label: title,
                        data: Object.values(data),
                        backgroundColor: [
                            "#ff6384",
                            "#36a2eb",
                            "#ffce56",
                            "#4bc0c0",
                            "#9966ff",
                            "#ff9f40",
                            "#c9cbcf",
                        ],
                    },
                ],
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        });
    }

    // Daily chart
    function updateDailyChart() {
        dailyDateSpan.textContent = formattedToday;

        const todayActivities = activities.filter((item) => item.date === formattedToday);
        const activityData = groupByActivity(todayActivities);

        createCharts(dailyPieChartCanvas, dailyBarChartCanvas, "Daily Activity", activityData);
    }

    // Weekly chart
    function updateWeeklyChart() {
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        weekStartSpan.textContent = formatDate(weekStart);
        weekEndSpan.textContent = formatDate(weekEnd);

        const weeklyActivities = activities.filter((item) => {
            const activityDate = new Date(item.date);
            return activityDate >= weekStart && activityDate <= weekEnd;
        });
        const activityData = groupByActivity(weeklyActivities);

        createCharts(weeklyPieChartCanvas, weeklyBarChartCanvas, "Weekly Activity", activityData);
    }

    // Monthly chart
    function updateMonthlyChart() {
        const today = new Date();
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        monthStartSpan.textContent = formatDate(monthStart);
        monthEndSpan.textContent = formatDate(monthEnd);

        const monthlyActivities = activities.filter((item) => {
            const activityDate = new Date(item.date);
            return activityDate >= monthStart && activityDate <= monthEnd;
        });
        const activityData = groupByActivity(monthlyActivities);

        createCharts(monthlyPieChartCanvas, monthlyBarChartCanvas, "Monthly Activity", activityData);
    }

    // Yearly chart
    function updateYearlyChart() {
        const thisYear = new Date().getFullYear();
        const yearlyActivities = activities.filter((item) =>
            item.date.startsWith(thisYear.toString())
        );
        const activityData = groupByActivity(yearlyActivities);

        createCharts(yearlyPieChartCanvas, yearlyBarChartCanvas, "Yearly Activity", activityData);
    }

    // Group activities by type
    function groupByActivity(data) {
        return data.reduce((acc, item) => {
            acc[item.activity] = (acc[item.activity] || 0) + item.duration;
            return acc;
        }, {});
    }

    // Format date for display (IST)
    function formatDate(date) {
        return date.toISOString().split("T")[0];
    }

    // Print weekly report
    printWeeklyButton.addEventListener("click", () => {
        const weeklyReport = document.getElementById("weekly-report").innerHTML;
        const printWindow = window.open("", "_blank");
        printWindow.document.write(`
            <html>
                <head>
                    <title>Weekly Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; }
                        h1, h2 { text-align: center; }
                        canvas { display: block; margin: 20px auto; }
                    </style>
                </head>
                <body>
                    <h1>Weekly Report</h1>
                    ${weeklyReport}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    });

    // Initialize charts
    updateCharts();
});





document.getElementById("clear-data").addEventListener("click", () => {
    if (confirm("Are you sure you want to clear all data?")) {
        localStorage.clear();
        alert("All data has been cleared.");
        // Optionally, update your UI to reflect the cleared data
        location.reload(); // Reload the page to reset the UI
    }
});