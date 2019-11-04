# vue-pie

## Add to project
```
npm install vue-pie
```

## Description
Vue pie chart component built with d3

## Project Dependencies
d3

## Props
The data element passed to functions is either the array element from the chartData or the property value of the chartData for the sectionKey. The id passed to functions is the sectionKey or the value returned from the selectIdentifier function.

| Prop | Required | Type | Description | Default |
| --- | --- | --- | ----------- | ----------- |
| Width | No | Number | Width of pie and legend | Container width |
| Height | No | Number | Height of pie and legend | Container width (to make a square) |
| chartData | Yes | Array or Object | The pie data. If it is an array then each element is its own section. If it's an object then the sectionKeys array will determine the sections. | |
| sectionKeys | No | Array | If the chartData is an object then this should be an array of which of it's properties should be sections. | [] |
| selectValue | No | Function | This function is used to pull the value that is being displayed by the pie chart. It receives the data element and the id and should return a numeric value. |  Returns the data element. (d) => d |

## Events
| Name | Arguments | Description |
| --- | --- | ----------- |
| Hover | Identifier | If hoverAnimation is set to true and no section is in a clicked state then this emitted when a section is moused overed or moused out. The identifier for which is currently hovered, or null when moving off a section, is passed. |
| Selected | Identifier | If sections are allowed to be in a clicked state (maxSelectedSections != 0) this is emitted when a new section is selected by either clicking the section or the legend element. |
| Unselected | | If sections are allowed to be in a clicked state (maxSelectedSections != 0) this is emitted when a selected section is de-selected by either clicking the section or the legend element. |

## Examples
<div style="display: flex;flex-wrap: wrap;">
  <img src="demo/pie.png" alt="Pie" width="350"/>

  <img src="demo/basic.gif" alt="Basic" width="350"/>

  <img src="demo/hover.gif" alt="Hover" width="350"/>

  <img src="demo/click.gif" alt="Click" width="350"/>

  <img src="demo/timer.gif" alt="Timer" width="350"/>

  <img src="demo/spinner.gif" alt="Spinner" width="350"/>
</div>