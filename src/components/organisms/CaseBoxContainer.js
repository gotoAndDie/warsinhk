import React from "react"
import Box from "@material-ui/core/Box"
import styled from "styled-components"
import {
  mapColorForClassification,
  mapColorForStatus,
} from "@/utils/colorHelper"
import _get from "lodash/get"
import _uniq from "lodash/uniq"
import * as moment from "moment"

const StyledBox = styled(Box)`
  position: relative;
  margin: 0 16px 10px 0;
  width: 32px;
  height: 32px;
  font-size: 12px;
  font-weight: 900;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  background: ${props => props.classificationcolor || "transparent"};

  border: 3px ${props => props.statuscolor} solid;
  box-shadow: 0px 2px 1px -1px rgba(0, 0, 0, 0.2),
    0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12);

  &:before,
  &:after {
    content: "";
    position: absolute;
    bottom: 0px;
    right: 0px;
    border-color: transparent;
    border-style: solid;
  }

  &:before {
    border-right-color: #f5f5f6;
    border-bottom-color: #f5f5f6;
  }

  &:after {
    border-radius: 100px;
    border-right-color: #f5f5f6;
    border-bottom-color: #f5f5f6;
  }
`
const WarsGroupContainer = styled(Box)`
  margin-bottom: 16px;
`

const GroupHeader = styled(Box)`
  margin-bottom: 4px;
`

const StyledContainer = styled(Box)`
  display: flex;
  flex-wrap: wrap;
`

export const WarsCaseBox = React.forwardRef((props, ref) => {
  const {
    cases: { node },
  } = props
  return (
    <StyledBox
      classificationcolor={mapColorForClassification(node.classification).main}
      statuscolor={mapColorForStatus(node.status).main}
    >
      {node.case_no}
    </StyledBox>
  )
})

export const WarsCaseBoxContainer = React.forwardRef((props, ref) => {
  const { filteredCases } = props

  // Grouping Logic:
  // 1. descending chronological order
  // 2. First row: Most recent date's case
  // 3. Other rows: Every 7 days a row eg. Feb 22- Feb 28, Feb 15 - Feb 21 etc
  const lastConfirmedDate = _get(
    filteredCases,
    "[0].node.confirmation_date",
    ""
  )
  const caseStartDate = moment("2020-01-21")

  const dateMap = {
    [lastConfirmedDate]: lastConfirmedDate,
  }
  let date = moment(lastConfirmedDate).add(-1, "day")
  let count = 0
  let dateLabel = ""
  while (date.isAfter(caseStartDate)) {
    if (count % 7 === 0) {
      dateLabel = `${date.format("YYYY-MM-DD")} - ${moment(date)
        .add(-7, "days")
        .format("YYYY-MM-DD")}`
    }
    dateMap[date.format("YYYY-MM-DD")] = dateLabel
    count++
    date = date.add(-1, "day")
  }
  const dates = _uniq(Object.values(dateMap))

  return (
    <>
      {dates.map(
        (dateKey, index) =>
          filteredCases.filter(
            ({ node }) => dateMap[node.confirmation_date] === dateKey
          ).length > 0 && (
            <WarsGroupContainer>
              <GroupHeader>{dateKey}</GroupHeader>
              <StyledContainer>
                {filteredCases
                  .filter(
                    ({ node }) => dateMap[node.confirmation_date] === dateKey
                  )
                  .map(cases => (
                    <WarsCaseBox cases={cases} />
                  ))}
              </StyledContainer>
            </WarsGroupContainer>
          )
      )}
    </>
  )
})
