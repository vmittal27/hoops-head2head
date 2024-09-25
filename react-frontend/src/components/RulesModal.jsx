import React, { useState } from 'react';
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel, 
    UnorderedList,
    List,
    ListItem,
    ListIcon,
    Link,
    Text,
    Box,
    Image,
    Flex,
    Button

} from '@chakra-ui/react'
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverHeader,
    PopoverBody,
    PopoverFooter,
    PopoverArrow,
    PopoverCloseButton,
    PopoverAnchor,
  } from '@chakra-ui/react'
import { FaBasketballBall } from "react-icons/fa";
import winningimage from '../components/winningguess.png'
import incorrectimage from '../components/wrongguess.png'
import correctimage from '../components/correctguess.png'

// import { ExternalLinkIcon } from '@chakra-ui/icons';

function RulesModal({isOpen, onOpen, onClose}) {
    const [openPopover, setOpenPopover] = useState(null);

    const handlePopoverOpen = (popoverId) => {
        setOpenPopover(popoverId);
    };

    const handlePopoverClose = () => {
        setOpenPopover(null);
    };

    return (
        <Modal blockScrollOnMount={false} size ={'lg'} isOpen={isOpen} onClose={onClose}>
            <ModalOverlay/>
            <ModalContent>
                <ModalHeader>About</ModalHeader>
                <ModalCloseButton color="black"/>
                <ModalBody>
                    <Tabs variant='enclosed'>
                        <TabList>
                            <Tab>How to Play</Tab>
                            <Tab>Scoring</Tab>
                            <Tab>About</Tab>
                        </TabList>

                        <TabPanels>
                            <TabPanel>
                                <List spacing={3}>
                                    <ListItem>
                                        <ListIcon as={FaBasketballBall} color='orange'/>
                                        Connect two NBA players based on mutual teammates!
                                    </ListItem>
                                    <ListItem>
                                        <ListIcon as={FaBasketballBall} color='orange'/>
                                        Complete the connection in as few guesses as possible.
                                    </ListItem>
                                    <ListItem>
                                        <ListIcon as={FaBasketballBall} color='orange'/>
                                        The game ends when the connection is complete or you have exhausted all your guesses.
                                    </ListItem>
                                    <ListItem>
                                        <ListIcon as={FaBasketballBall} color='orange'/>
                                        Currently, player connections are updated to before the 2024 NBA offseason.
                                    </ListItem>
                                </List>
                                <Text fontWeight='bold' mt='2em' mb='1em'>Examples:</Text>
                                <Flex gap={5}>
                                    <Popover
                                        isOpen={openPopover === 'correct'}
                                        onOpen={() => handlePopoverOpen('correct')}
                                        onClose={handlePopoverClose}
                                    >
                                        <PopoverTrigger>
                                            <Button>Correct Guess</Button>
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            <PopoverArrow />
                                            <PopoverCloseButton />
                                            <PopoverHeader size='sm' mt='0.5em'>
                                                LeBron and Anthony Davis have been teammates, but Anthony Davis 
                                                and Jayson Tatum have never been teammates, so the connection is not complete.
                                            </PopoverHeader>
                                            <PopoverBody>
                                                <Image src={correctimage}/>
                                            </PopoverBody>
                                        </PopoverContent>
                                    </Popover>
                                    <Popover
                                        isOpen={openPopover === 'wrong'}
                                        onOpen={() => handlePopoverOpen('wrong')}
                                        onClose={handlePopoverClose}
                                    >
                                        <PopoverTrigger>
                                            <Button>Wrong Guess</Button>
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            <PopoverArrow />
                                            <PopoverCloseButton />
                                            <PopoverHeader size='sm' mt='0.5em'>
                                                LeBron and Stephen Curry have never been teammates, so this guess is incorrect.
                                            </PopoverHeader>
                                            <PopoverBody>
                                                <Image src={incorrectimage}/>
                                            </PopoverBody>
                                        </PopoverContent>
                                    </Popover>
                                    <Popover
                                        isOpen={openPopover === 'winning'}
                                        onOpen={() => handlePopoverOpen('winning')}
                                        onClose={handlePopoverClose}
                                    >
                                        <PopoverTrigger>
                                            <Button>Winning Guess</Button>
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            <PopoverArrow />
                                            <PopoverCloseButton />
                                            <PopoverHeader size='sm' mt='0.5em'>
                                                LeBron and Kyrie Irving have been teammates, and since Kyrie Irving and Jayson Tatum have been teammates, 
                                                the connection is complete!
                                            </PopoverHeader>
                                            <PopoverBody>
                                                <Image src={winningimage}/>
                                            </PopoverBody>
                                        </PopoverContent>
                                    </Popover>
                                </Flex>
                            </TabPanel>
                            <TabPanel>
                                <UnorderedList>
                                    <ListItem>
                                        Highest Score Wins
                                    </ListItem>
                                    <ListItem>
                                        Your score is based on the number of guesses used and how well-known the teammate pairing is.
                                    </ListItem>
                                    <ListItem>
                                        For example, connecting LeBron James with Dwayne Wade would give you less points than connecting LeBron James with Derrick Rose would.
                                    </ListItem>
                                </UnorderedList>
                            </TabPanel>
                            <TabPanel>
                                Hoops Head 2 Head was made by Sriram, Shrivas, Siddarth, and Viresh, 4 students at the University of Chicago.
                                <br/>
                                <br/>
                                <Text>
                                    You can see the source code for this game{' '}
                                    <Link color='teal.500' href='https://github.com/vmittal27/hoops-head2head' isExternal>
                                         here.
                                    </Link>
                                </Text>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </ModalBody>
                <ModalFooter/>
            </ModalContent>
        </Modal>
    )
}

export default RulesModal;