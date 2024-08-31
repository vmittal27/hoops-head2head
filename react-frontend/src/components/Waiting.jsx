import { React, useState, useEffect } from 'react'
import { CircularProgress, CircularProgressLabel, Heading } from '@chakra-ui/react'

function Waiting({numFinished, totalNumber}) {
    const percent = (numFinished / totalNumber) * 100
    return (
        <div>
            <Heading size='md'>
                Waiting for other players . . .
            </Heading>
            <CircularProgress size='md' value={percent}>
                <CircularProgressLabel fontSize='lg'>Players Finished: {numFinished}</CircularProgressLabel>
            </CircularProgress>
        </div>
    )
}

export default Waiting