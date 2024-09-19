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
    ListItem,
    Link,
    Text

} from '@chakra-ui/react'

// import { ExternalLinkIcon } from '@chakra-ui/icons';

function RulesModal({isOpen, onOpen, onClose}) {
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
                                <UnorderedList>
                                    <ListItem>
                                        Connect two NBA players based on mutual teammates
                                    </ListItem>
                                    <ListItem>
                                        Complete the connection in as few guesses as possible
                                    </ListItem>
                                    <ListItem>
                                        The game ends when the connection is complete or you have exhausted all your guesses
                                    </ListItem>
                                    <ListItem>
                                        Currently, player connections are updated to before the 2024 NBA offseason
                                    </ListItem>
                                </UnorderedList>
                            </TabPanel>
                            <TabPanel>
                                <UnorderedList>
                                    <ListItem>
                                        A higher score is better
                                    </ListItem>
                                    <ListItem>
                                        For correct guesses, obvious teammates add less points than guessing less well-known teammates do
                                    </ListItem>
                                    <ListItem>
                                        Incorrect guesses add 0 points, and each correct guess adds less points if more guesses are used
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