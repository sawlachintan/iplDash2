const colors = {
    csk: "#ffbf00",
    mi: "#2196f3",
    rcb: "#b71c1c",
    kkr: "#8739fa",
    delhi: "#2979ff",
    pbks: "#ef5350",
    rr: "#f06292",
    srh: "#ff5722",
    ktk: "#ab47bc",
    gl: "#f57c00",
    rps: "#d81b60",
    deccan: "#607d8b",
    pwi: "#00bcd4",
  };
  
  //dark-mode toggling
  const btn = document.querySelector(".dark-mode-toggle");
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
  const prefersLightScheme = window.matchMedia("(prefers-color-scheme: light)");
  const currentTheme = localStorage.getItem("theme");
  
  const today = new Date();
  const hours = today.getHours();
  var graphColor = "#ededed";
  //if user preferred theme is dark
  if (currentTheme === "dark") {
    document.body.classList.add("dark-theme");
    graphColor = "#222";
    //if user preferred theme is light
  } else if (currentTheme === "light") {
    document.body.classList.add("light-theme");
    graphColor = "#ededed";
  } else {
    //if OS preferred theme is dark
    if (prefersDarkScheme.matches) {
      document.body.classList.add("dark-theme");
      document.body.classList.remove("light-theme");
      localStorage.setItem("theme", "dark");
      graphColor = "#222";
      //if OS preferred theme is light
    } else if (prefersLightScheme.matches) {
      document.body.classList.remove("dark-theme");
      document.body.classList.add("light-theme");
      localStorage.setItem("theme", "light");
      graphColor = "#ededed";
    } else {
      // if localstorage and os preferences are not accessible, set it based on time
      //if local time is less than 8PM or greater than 7AM, set light
      if (hours < 20 && hours > 7) {
        document.body.classList.remove("dark-theme");
        document.body.classList.add("light-theme");
        localStorage.setItem("theme", "light");
        graphColor = "#ededed";
        //if local time is greater than or equal to 8PM or less than or equal to 7AM, set dark
      } else {
        document.body.classList.add("dark-theme");
        document.body.classList.remove("light-theme");
        localStorage.setItem("theme", "dark");
        graphColor = "#222";
      }
    }
  }
  
  var startTime = localStorage.getItem("start");
  var endTime = localStorage.getItem("end");
  if (startTime === null) {
    startTime = 2008;
  }
  if (endTime === null) {
    endTime = 2021;
  }
  
  startTime = 2008;
  localStorage.setItem("start", startTime);
  endTime = 2021;
  localStorage.setItem("end", endTime);
  
  darkModeCharts = (bool, preferredTeam) => {
    d3.csv("./data/main_data.csv", rowConverter).then(function (data) {
      // console.log(data[0]);
      dataset = data;
  
      var filterData = dataset.filter(function (d) {
        //add conditions of time as well
        if (
          d["abb"] === preferredTeam &&
          d["year"] >= startTime &&
          d["year"] <= endTime
        ) {
          return d;
        }
      });
  
      const newWins = d3.sum(filterData, (item) => item.wins);
      const newMatches = d3.sum(filterData, (item) => item.matches);
  
      var winPercent = newWins / newMatches;
      if (newMatches === 0) {
        winPercent = 0.00001;
      }
  
      const donutData = [winPercent, 1 - winPercent];
  
      updateDonut(donutData);
  
      if (!bool) {
        const cardArray = [
          "sixes",
          "fours",
          "toss-wins",
          "wins",
          "runs",
          "wickets",
        ];
  
        cardArray.forEach((key) => {
          var prevVal = parseInt(
            document.getElementById(key).textContent.replace(",", "")
          );
          var newVal = d3.sum(filterData, (item) => item[key]);
          if (key === "toss-wins") {
            newVal = d3.sum(filterData, (item) => item["toss_wins"]);
          }
  
          cardNumTransition(
            d3
              .select("#" + key)
              .text(d3.format(",.0f")(newVal))
              .transition(),
            prevVal,
            newVal
          );
        });
  
        const prevWinPercent =
          parseFloat(
            document.getElementById("donutNumber").textContent.replace("%", "")
          ) / 100;
  
        donutNumTransition(
          d3
            .select("#donutNumber")
            .text(d3.format(".2%")(winPercent))
            .transition(),
          prevWinPercent,
          winPercent
        );
      }
    });
  };
  
  //dark theme changes when user interacts with the toggle
  btn.addEventListener("click", function () {
    console.log("btn clicked!");
    if (document.body.classList.contains("dark-theme")) {
      document.body.classList.remove("dark-theme");
      document.body.classList.add("light-theme");
      localStorage.setItem("theme", "light");
      graphColor = "#ddd";
  
      darkModeCharts(true, teamID);
    } else {
      document.body.classList.add("dark-theme");
      document.body.classList.remove("light-theme");
      localStorage.setItem("theme", "dark");
      graphColor = "#222";
  
      darkModeCharts(true, teamID);
    }
  });
  
  //responsive hamburger menu
  const navSlider = () => {
    const burger = document.querySelector(".burger");
    const nav = document.querySelector(".nav-links");
  
    const navLinks = document.querySelectorAll(".nav-links li");
  
    burger.addEventListener("click", () => {
      nav.classList.toggle("nav-active");
  
      navLinks.forEach((link, index) => {
        if (link.style.animation) {
          link.style.animation = "";
        } else {
          link.style.animation = `navLinksFade 0.5s ease forwards ${
            index / 7 + 0.75
          }s`;
        }
      });
    });
  };
  navSlider();
  
  //navigation links toggling
  
  //team buttons toggling
  const buttonContainer = document.querySelector(".button-container");
  const buttons = buttonContainer.querySelectorAll("button");
  
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
  }
  
  function donutNumTransition(transition, prevVal, currVal) {
    transition.duration(transitionDuration).tween("text", function () {
      const i = d3.interpolateNumber(prevVal, currVal);
  
      return function (t) {
        this.textContent = d3.format(".2%")(i(t));
      };
    });
  }
  
  var preferredTeam = localStorage.getItem("team");
  // var teamID = preferredTeam;
  
  if (preferredTeam === null) {
    preferredTeam = "csk";
  }
  
  document.querySelector(".dashboard").classList.add(preferredTeam);
  document.getElementById(preferredTeam + "-btn").classList.add("active");
  
  darkModeCharts(false, preferredTeam);
  
  buttons.forEach((btn) => {
    btn.addEventListener("click", function (e) {
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
  
      darkModeCharts(false, teamID);
    });
  });
  
  var rowConverter = function (d) {
    return {
      team: d.team,
      abb: d.abb,
      city: d.city,
      sixes: parseInt(d.sixes),
      fours: parseInt(d.fours),
      toss_wins: parseInt(d.toss_wins),
      wins: parseInt(d.wins),
      runs: parseInt(d.runs),
      wickets: parseInt(d.wickets),
      year: parseInt(d.year),
      matches: parseInt(d.matches),
      two_hundreds: parseInt(d.two_hundreds),
      ten_wickets: parseInt(d.ten_wickets),
    };
  };
  
  var donutHeight = 300;
  var donutWidth = 305;
  var donutMargin = 10;
  
  var donutRadius = Math.min(donutWidth, donutHeight) / 2 - donutMargin;
  
  var donutSvg = d3
    .select("#donut")
    .append("svg")
    .attr("width", donutWidth)
    .attr("height", donutHeight)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 300 300")
    .append("g")
    .attr("id", "donutToCopy")
    .attr("class", "arc")
    .attr(
      "transform",
      "translate(" + donutWidth / 2 + "," + donutHeight / 2 + ")"
    );
  
  function updateDonut(data) {
    var pie = d3
      .pie()
      .sort(null)
      .startAngle(-Math.PI / 2)
      .endAngle(Math.PI / 2);
  
    var data_ready = pie(data);
  
    preferredTeam = localStorage.getItem("team");
  
    var colorScale = d3.scaleOrdinal([colors[preferredTeam], graphColor]);
  
    var u = donutSvg.selectAll("path").data(data_ready);
  
    u.enter()
      .append("path")
      .merge(u)
      .transition()
      .duration(650)
      .attr(
        "d",
        d3
          .arc()
          .innerRadius(donutRadius / 1.32)
          .outerRadius(donutRadius)
      )
      .attr("fill", function (d, i) {
        return colorScale(i);
      });
  
    u.exit().remove();
  }
  