import { React, useState, useEffect } from 'react'
import { Text, Heading, Spinner } from '@chakra-ui/react'

function Loading () {
    return (
        <>
            <Heading size='md'>
                Loading players...
            </Heading>
            <Spinner 
                size='xl'
                color='orange'
            />
        </>
    )
}

export default Loading