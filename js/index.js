//dark-mode toggling
const btn = document.querySelector(".dark-mode-toggle");
const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
const prefersLightScheme = window.matchMedia("(prefers-color-scheme: light)");
const currentTheme = localStorage.getItem("theme");

const today = new Date()
const hours = today.getHours();

//if user preferred theme is dark
if (currentTheme === 'dark') {
    document.body.classList.add("dark-theme");
    //if user preferred theme is light
} else if (currentTheme === 'light') {
    document.body.classList.add("light-theme");
} else {
    //if OS preferred theme is dark
    if (prefersDarkScheme.matches) {
        document.body.classList.add("dark-theme");
        document.body.classList.remove("light-theme");
        localStorage.setItem("theme", "dark");
        //if OS preferred theme is light
    } else if (prefersLightScheme.matches) {
        document.body.classList.remove("dark-theme");
        document.body.classList.add("light-theme");
        localStorage.setItem("theme", "light");
    } else {
        // if localstorage and os preferences are not accessible, set it based on time
        //if local time is less than 8PM or greater than 7AM, set light
        if (hours < 20 && hours > 7) {
            document.body.classList.remove("dark-theme");
            document.body.classList.add("light-theme");
            localStorage.setItem("theme", "light");
            //if local time is greater than or equal to 8PM or less than or equal to 7AM, set dark
        } else {
            document.body.classList.add("dark-theme");
            document.body.classList.remove("light-theme");
            localStorage.setItem("theme", "dark");
        }
    }
}

//dark theme changes when user interacts with the toggle
btn.addEventListener("click", function () {
    console.log("btn clicked!")
    if (document.body.classList.contains("dark-theme")) {
        document.body.classList.remove("dark-theme");
        document.body.classList.add("light-theme");
        localStorage.setItem("theme", "light");
    } else {
        document.body.classList.add("dark-theme");
        document.body.classList.remove("light-theme");
        localStorage.setItem("theme", "dark");
    }

})

//responsive hamburger menu
const navSlider = () => {
    const burger = document.querySelector(".burger");
    const nav = document.querySelector(".nav-links");

    const navLinks = document.querySelectorAll(".nav-links li");

    burger.addEventListener('click', () => {
        nav.classList.toggle('nav-active');

        navLinks.forEach((link, index) => {
            if (link.style.animation) {
                link.style.animation = '';
            } else {
                link.style.animation = `navLinksFade 0.5s ease forwards ${index / 7 + 0.75}s`;
            }

        });
    });
}
navSlider();

//navigation links toggling


//team buttons toggling
const buttonContainer = document.querySelector(".button-container")
const buttons = buttonContainer.querySelectorAll('button');

const currentTeam = localStorage.getItem("team");
const dashboardContainer = document.querySelector(".dashboard");
const transitionDuration = 650;

function cardNumTransition(transition, prevVal, currVal) {
    transition.duration(transitionDuration).tween("text", function () {
        const i = d3.interpolateNumber(prevVal, currVal);

        return function (t) {
            this.textContent = d3.format(",.0f")(i(t));
        };
    });
};



var preferredTeam = localStorage.getItem("team");

if (preferredTeam === null) {
    preferredTeam = 'csk';
}

var startTime = localStorage.getItem('start');
var endTime = localStorage.getItem('end');
if (startTime === null) {
    startTime = 2008;
}
if (endTime === null) {
    endTime = 2021;
}


document.querySelector(".dashboard").classList.add(preferredTeam);
document.getElementById(preferredTeam + "-btn").classList.add('active');
d3.csv("./data/cards.csv", rowConverter).then(function (data) {
    // console.log(data[0]);
    dataset = data;

    localStorage.setItem('start', startTime);
    localStorage.setItem('end', endTime);

    var filterData = dataset.filter(function (d) {
        //add conditions of time as well
        if ((d['abb'] === preferredTeam) && (d['year'] >= startTime) && (d['year'] <= endTime)) {
            return d;
        }
    });

    console.log(filterData);
    console.log(d3.sum(filterData, item => item.wins));

    const newSixes = d3.sum(filterData, item => item.sixes);
    const prevSixes = parseInt(document.getElementById("sixes").textContent.replace(",", ""));
    const newFours = d3.sum(filterData, item => item.fours);
    const prevFours = parseInt(document.getElementById("fours").textContent.replace(",", ""));
    const newTossWins = d3.sum(filterData, item => item.toss_wins);
    const prevTossWins = parseInt(document.getElementById("toss-wins").textContent.replace(",", ""));
    const newWins = d3.sum(filterData, item => item.wins);
    const prevWins = parseInt(document.getElementById("wins").textContent.replace(",", ""));
    const newRuns = d3.sum(filterData, item => item.runs);
    const prevRuns = parseInt(document.getElementById("runs").textContent.replace(",", ""));
    const newWickets = d3.sum(filterData, item => item.wickets);
    const prevWickets = parseInt(document.getElementById("wickets").textContent.replace(",", ""));

    cardNumTransition(d3.select('#sixes').text(d3.format(",.0f")(newSixes)).transition().duration(transitionDuration), prevSixes, newSixes);

    cardNumTransition(d3.select('#fours').text(d3.format(",.0f")(newFours)).transition().duration(transitionDuration), prevFours, newFours);

    cardNumTransition(d3.select('#toss-wins').text(d3.format(",.0f")(newTossWins)).transition().duration(transitionDuration), prevTossWins, newTossWins);

    cardNumTransition(d3.select('#wins').text(d3.format(",.0f")(newWins)).transition().duration(transitionDuration), prevWins, newWins);

    cardNumTransition(d3.select('#runs').text(d3.format(",.0f")(newRuns)).transition().duration(transitionDuration), prevRuns, newRuns);

    cardNumTransition(d3.select('#wickets').text(d3.format(",.0f")(newWickets)).transition().duration(transitionDuration), prevWickets, newWickets);


})




buttons.forEach(btn => {
    btn.addEventListener('click', function (e) {

        // console.log(btn.id);
        teamID = btn.id.split("-")[0];

        //change code
        var current = buttonContainer.getElementsByClassName("active");

        var dashboardClasses = dashboardContainer.classList;


        if (dashboardClasses.length == 1) {
            dashboardContainer.classList.add(teamID);
            localStorage.setItem("team", teamID);
        }

        if (dashboardClasses.length == 2) {
            dashboardContainer.classList.remove(dashboardClasses[1]);
            dashboardContainer.classList.add(teamID);
            localStorage.setItem("team", teamID);
        }

        // If there's no active class
        if (current.length > 0) {
            current[0].className = current[0].className.replace(" active", "");
        }

        // Add the active class to the current/clicked button
        this.className += " active";

        d3.csv("./data/cards.csv", rowConverter).then(function (data) {
            dataset = data;

            var startTime = 2016;
            var endTime = 2021;
            localStorage.setItem('start', startTime);
            localStorage.setItem('end', endTime);

            var filterData = dataset.filter(function (d) {
                //add conditions of time as well
                if ((d['abb'] === teamID) && (d['year'] >= startTime) && (d['year'] <= endTime)) {
                    return d;
                }
            });
            console.log(filterData);
            console.log(d3.sum(filterData, item => item.wins));

            const newSixes = d3.sum(filterData, item => item.sixes);
            const prevSixes = parseInt(document.getElementById("sixes").textContent.replace(",", ""));
            const newFours = d3.sum(filterData, item => item.fours);
            const prevFours = parseInt(document.getElementById("fours").textContent.replace(",", ""));
            const newTossWins = d3.sum(filterData, item => item.toss_wins);
            const prevTossWins = parseInt(document.getElementById("toss-wins").textContent.replace(",", ""));
            const newWins = d3.sum(filterData, item => item.wins);
            const prevWins = parseInt(document.getElementById("wins").textContent.replace(",", ""));
            const newRuns = d3.sum(filterData, item => item.runs);
            const prevRuns = parseInt(document.getElementById("runs").textContent.replace(",", ""));
            const newWickets = d3.sum(filterData, item => item.wickets);
            const prevWickets = parseInt(document.getElementById("wickets").textContent.replace(",", ""));

            cardNumTransition(d3.select('#sixes').text(d3.format(",.0f")(newSixes)).transition().duration(transitionDuration), prevSixes, newSixes);

            cardNumTransition(d3.select('#fours').text(d3.format(",.0f")(newFours)).transition().duration(transitionDuration), prevFours, newFours);

            cardNumTransition(d3.select('#toss-wins').text(d3.format(",.0f")(newTossWins)).transition().duration(transitionDuration), prevTossWins, newTossWins);

            cardNumTransition(d3.select('#wins').text(d3.format(",.0f")(newWins)).transition().duration(transitionDuration), prevWins, newWins);

            cardNumTransition(d3.select('#runs').text(d3.format(",.0f")(newRuns)).transition().duration(transitionDuration), prevRuns, newRuns);

            cardNumTransition(d3.select('#wickets').text(d3.format(",.0f")(newWickets)).transition().duration(transitionDuration), prevWickets, newWickets);



        })

    })
})

var rowConverter = function (d) {
    return {
        team: d.team,
        abb: d.abb,
        sixes: parseInt(d.sixes),
        fours: parseInt(d.fours),
        toss_wins: parseInt(d.toss_wins),
        wins: parseInt(d.wins),
        runs: parseInt(d.runs),
        wickets: parseInt(d.wickets),
        year: parseInt(d.year)
    };
}
