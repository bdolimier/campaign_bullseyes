  var json = [

     // uk
	 {
	 "id": "uk",
	 "name": "uk",
	 "data": {
	     "$color": "#EBB056",
	     "$type": "triangle",
	     "$dim": 1,
	     "$view": 5,
		 "$lvl": 1,
		 "$parent": ""
	 }
},
// usa
{
  "id": "usa",
  "name": "usa",
  "data": {
	"$color": "#EBB056",
	"$type": "triangle",
	"$dim": 2,
	"$view": 10,
    "$lvl": 1,
    "$parent": ""
  }
},	
// france
{
  "id": "france",
  "name": "france",
  "data": {
	"$color": "#EBB056",
	"$type": "triangle",
	"$dim": 3,
	"$view": 15,
    "$lvl": 1,
    "$parent": ""
  }
},	
//japan
{
  "id": "japan",
  "name": "japan",
  "data": {
	"$color": "#EBB056",
	"$type": "triangle",
	"$dim": 18,
	"$view": 20,
    "$lvl": 1,
    "$parent": ""
  }
},	
// usa gree Publisher -> Placement -> Site
{
  "id": "usa pubA",
  "name": "usa pubA",
  "data": {
	"$color": "#416D9C",
	"$type": "triangle",
	"$dim": 8,
	"$view": 9,
    "$lvl": 2,
    "$parent": "usa"
  },
  "adjacencies": [
  {
	"nodeTo": "usa",
	"nodeFrom": "usa pubA",
	"data": {
	  "$color": "#557EAA"
	}
  }
  ]
},	
//usa android
{
  "id": "usa zynga",
  "name": "usa zynga",
  "data": {
	"$color": "#416D9C",
	"$type": "triangle",
	"$dim": 8,
	"$view": 11,
	"$lvl": 2,
    "$parent": "usa"
  },
  "adjacencies": [
  {
	"nodeTo": "usa",
	"nodeFrom": "usa zynga",
	"data": {
	  "$color": "#557EAA"
	}
  }
  ]
},
//france gree
{
  "id": "france gree",
  "name": "france gree",
  "data": {
	"$color": "#416D9C",
	"$type": "triangle",
	"$dim": 8,
	"$view": 15,
    "$lvl": 2,
    "$parent": "france"
  },
  "adjacencies": [
  {
	"nodeTo": "france",
	"nodeFrom": "france gree",
	"data": {
	  "$color": "#557EAA"
	}
  }
  ]
},	
//france zynga
{
  "id": "france zynga",
  "name": "france zynga",
  "data": {
	"$color": "#416D9C",
	"$type": "triangle",
	"$dim": 8,
	"$view": 14,
	"$lvl": 2,
    "$parent": "france"
  },
  "adjacencies": [
  {
	"nodeTo": "france",
	"nodeFrom": "france zynga",
	"data": {
	  "$color": "#557EAA"
	}
  }
  ]
},
//france zynga
{
  "id": "france JSoft",
  "name": "france JSoft",
  "data": {
	"$color": "#416D9C",
	"$type": "triangle",
	"$dim": 8,
	"$view": 13,
	"$lvl": 2,
    "$parent": "france"
  },
  "adjacencies": [
  {
	"nodeTo": "france",
	"nodeFrom": "france JSoft",
	"data": {
	  "$color": "#557EAA"
	}
  }
  ]
},
//uk zynga
{
  "id": "uk zynga",
  "name": "uk zynga",
  "data": {
	"$color": "#416D9C",
	"$type": "triangle",
	"$dim": 8,
	"$view": 10,
	"$lvl": 2,
    "$parent": "uk"
  },
  "adjacencies": [
  {
	"nodeTo": "uk",
	"nodeFrom": "uk zynga",
	"data": {
	  "$color": "#557EAA"
	}
  }
  ]
},
//uk zynga
{
  "id": "uk JSoft",
  "name": "uk JSoft",
  "data": {
	"$color": "#416D9C",
	"$type": "triangle",
	"$dim": 8,
	"$view": 6,
	"$lvl": 2,
    "$parent": "uk"
  },
  "adjacencies": [
  {
	"nodeTo": "uk",
	"nodeFrom": "uk JSoft",
	"data": {
	  "$color": "#557EAA"
	}
  }
  ]
},
//uk zynga
{
  "id": "uk EA",
  "name": "uk EA",
  "data": {
	"$color": "#416D9C",
	"$type": "triangle",
	"$dim": 8,
	"$view": 4,
	"$lvl": 2,
    "$parent": "uk"
  },
  "adjacencies": [
  {
	"nodeTo": "uk",
	"nodeFrom": "uk EA",
	"data": {
	  "$color": "#557EAA"
	}
  }
  ]
},
//uk GamesKL
{
  "id": "uk GamesKL",
  "name": "uk GamesKL",
  "data": {
	"$color": "#416D9C",
	"$type": "triangle",
	"$dim": 8,
	"$view": 5,
	"$lvl": 2,
    "$parent": "uk"
  },
  "adjacencies": [
  {
	"nodeTo": "uk",
	"nodeFrom": "uk GamesKL",
	"data": {
	  "$color": "#557EAA"
	}
  }
  ]
},
//uk zynga 4.3
{
  "id": "uk zynga43",
  "name": "uk zynga 4.3",
  "data": {
	"$color": "#41fa30",
	"$type": "square",
	"$dim": 6,
	"$view": 12,
	"$lvl": 3,
    "$parent": "uk zynga"
  },
  "adjacencies": [
  {
	"nodeTo": "uk zynga",
	"nodeFrom": "uk zynga43",
	"data": {
	  "$color": "#557EAA"
	}
  }
  ]
},
//uk zynga XP
{
  "id": "uk zyngaXP",
  "name": "uk zynga XP",
  "data": {
	"$color": "#41fa30",
	"$type": "square",
	"$dim": 6,
	"$view": 8,
	"$lvl": 3,
    "$parent": "uk zynga"
  },
  "adjacencies": [
  {
	"nodeTo": "uk zynga",
	"nodeFrom": "uk zyngaXP",
	"data": {
	  "$color": "#557EAA"
	}
  }
  ]
},
//usa zynga 4.3
{
  "id": "usa zynga43",
  "name": "usa zynga 4.3",
  "data": {
	"$color": "#41fa30",
	"$type": "square",
	"$dim": 6,
	"$view": 18,
	"$lvl": 3,
    "$parent": "usa zynga"
  },
  "adjacencies": [
  {
	"nodeTo": "usa zynga",
	"nodeFrom": "usa zynga43",
	"data": {
	  "$color": "#557EAA"
	}
  }
  ]
},
//usa zynga XP
{
  "id": "usa zyngaXP",
  "name": "usa zynga XP",
  "data": {
	"$color": "#41fa30",
	"$type": "square",
	"$dim": 6,
	"$view": 6,
	"$lvl": 3,
    "$parent": "usa zynga"
  },
  "adjacencies": [
  {
	"nodeTo": "usa zynga",
	"nodeFrom": "usa zyngaXP",
	"data": {
	  "$color": "#557EAA"
	}
  }
  ]
},
// france zynga 4.3
{
  "id": "france zynga43",
  "name": "france zynga 4.3",
  "data": {
	"$color": "#41fa30",
	"$type": "square",
	"$dim": 6,
	"$view": 18,
	"$lvl": 3,
    "$parent": "france zynga"
  },
  "adjacencies": [
  {
	"nodeTo": "france zynga",
	"nodeFrom": "france zynga43",
	"data": {
	  "$color": "#557EAA"
	}
  }
  ]
},
//france zynga 4.3
{
  "id": "france zyngaXP",
  "name": "france zynga XP",
  "data": {
	"$color": "#41fa30",
	"$type": "square",
	"$dim": 6,
	"$view": 13,
	"$lvl": 3,
    "$parent": "france zynga"
  },
  "adjacencies": [
  {
	"nodeTo": "france zynga",
	"nodeFrom": "france zyngaXP",
	"data": {
	  "$color": "#557EAA"
	}
  }
  ]
},
//france zynga 4.3
{
  "id": "france zynga DDR",
  "name": "france zynga DDR",
  "data": {
	"$color": "#41fa30",
	"$type": "square",
	"$dim": 6,
	"$view": 12,
	"$lvl": 3,
    "$parent": "france zynga"
  },
  "adjacencies": [
  {
	"nodeTo": "france zynga",
	"nodeFrom": "france zyngaDDR",
	"data": {
	  "$color": "#557EAA"
	}
  }
  ]
},
//france JSoft 4.3
{
  "id": "france JSoft43",
  "name": "france JSoft 4.3",
  "data": {
	"$color": "#41fa30",
	"$type": "square",
	"$dim": 6,
	"$view": 18,
	"$lvl": 3,
    "$parent": "france JSoft"
  },
  "adjacencies": [
  {
	"nodeTo": "france JSoft",
	"nodeFrom": "france JSoft43",
	"data": {
	  "$color": "#557EAA"
	}
  }
  ]
},
//france JSoft 4.3
{
  "id": "france JSoftXP",
  "name": "france JSoft XP",
  "data": {
	"$color": "#41fa30",
	"$type": "square",
	"$dim": 6,
	"$view": 12,
	"$lvl": 3,
    "$parent": "france JSoft"
  },
  "adjacencies": [
  {
	"nodeTo": "france JSoft",
	"nodeFrom": "france JSoftXP",
	"data": {
	  "$color": "#557EAA"
	}
  }
  ]
},
//france JSoft 4.3
{
  "id": "france JSoft DDR",
  "name": "france JSoft DDR",
  "data": {
	"$color": "#41fa30",
	"$type": "square",
	"$dim": 6,
	"$view": 10,
	"$lvl": 3,
    "$parent": "france JSoft"
  },
  "adjacencies": [
  {
	"nodeTo": "france JSoft",
	"nodeFrom": "france JSoftDDR",
	"data": {
	  "$color": "#557EAA"
	}
  }
  ]
},
{
	  "id": "fr JSoftDRD Site1",
	  "name": "fr JSoftDRD Site1",
	  "data": {
		"$color": "#fa3030",
		"$type": "star",
		"$dim": 6,
		"$view": 12.8,
		"$lvl": 3,
	    "$parent": "france JSoft DDR"
	  },
	  "adjacencies": [
	  {
		"nodeTo": "france JSoft DDR",
		"nodeFrom": "fr JSoftDRD Site1",
		"data": {
		  "$color": "#557EAA"
		}
	  }
	  ]
	},
  ];
  /*
{
      "adjacencies": [
          {
            "nodeTo": "iphone2",
            "nodeFrom": "ios",
            "data": {
              "$color": "#909291"
            }
          }, {
            "nodeTo": "iphone3",
            "nodeFrom": "ios",
            "data": {
              "$color": "#557EAA",
           	  "$view": 300

            }
          }, {
            "nodeTo": "iphone5",
            "nodeFrom": "ios",
            "data": {
              "$color": "#557EAA",
           	  "$view": 50
            }
          }
      ],
      "data": {
        "$color": "#416D9C",
        "$type": "triangle",
        "$dim": 7,
        "$height": -100,
        "$width": 20,
        "$view": 15
      },
      "id": "ios",
      "name": "ios"
},
{
      "adjacencies": [
          {
            "nodeTo": "nokia",
            "nodeFrom": "android",
            "data": {
              "$color": "#909291"
            }
          }, {
            "nodeTo": "samsung",
            "nodeFrom": "android",
            "data": {
              "$color": "#557EAA"
            }
          }, {
            "nodeTo": "motorola",
            "nodeFrom": "android",
            "data": {
              "$color": "#557EAA"
            }
          }, {
            "nodeTo": "sole",
            "nodeFrom": "android",
            "data": {
              "$color": "#557EAA"
            }
          }
      ],
	"data": {
        "$color": "#416D9C",
        "$type": "triangle",
        "$dim": 7,
        "$view": 15
      },
      "id": "android",
      "name": "android"
  },

{
    "adjacencies": [
        {
          "nodeTo": "win1",
          "nodeFrom": "JSoft",
          "data": {
            "$color": "#909291",
            "$view": 15
          }
        }, {
          "nodeTo": "win fon 2",
          "nodeFrom": "windows",
          "data": {
            "$color": "#557EAA",
            "$view": 350

          }
        }, {
          "nodeTo": "win tele 3",
          "nodeFrom": "windows",
          "data": {
            "$color": "#557EAA",
         	"$view": 50
          }
        }, {
          "nodeTo": "wx4",
          "nodeFrom": "windows",
          "data": {
            "$color": "#557EAA",
            "$view": 150
          }
        }
    ],
	"data": {
      "$color": "#416D9C",
      "$type": "triangle",
      "$dim": 7,
      "$view": 215
    },
    "id": "windows",
    "name": "windows"
},
{
    "adjacencies": [
        {
          "nodeTo": "rim n1",
          "nodeFrom": "windows",
          "data": {
            "$color": "#909291",
            "$view": 50
          }
        }, {
          "nodeTo": "rim n2",
          "nodeFrom": "windows",
          "data": {
            "$color": "#557EAA",
         	"$view": 450
          }
        }, {
          "nodeTo": "rim n3",
          "nodeFrom": "windows",
          "data": {
            "$color": "#557EAA",
            "$height": -500,
            "$width": -140
          }
        }, {
          "nodeTo": "rim n4",
          "nodeFrom": "windows",
          "data": {
            "$color": "#557EAA",
            "$height": -525,
            "$width": -160
          }
        }
    ],
	"data": {
      "$color": "#416D9C",
      "$type": "triangle",
      "$dim": 7,
      "$height": -40,
      "$width": -200,
      "$view": 15
    },
    "id": "rim",
    "name": "rim"
}

];
  
  
  /*
  {
  "nodeTo": "ios",
  "nodeFrom": "usa",
  "data": {
    "$color": "#557EAA"
  }
}, {
  "nodeTo": "android",
  "nodeFrom": "usa",
  "data": {
    "$color": "#909291"
  }
}, {
  "nodeTo": "windows",
  "nodeFrom": "usa",
  "data": {
    "$color": "#909291",
 	  "$view": 50
  }
}, {
  "nodeTo": "rim",
  "nodeFrom": "usa",
  "data": {
    "$color": "#909291",
 	  "$view": 50
  }
}*/