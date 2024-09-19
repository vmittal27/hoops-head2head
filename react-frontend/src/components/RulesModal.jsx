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
    ListItem

} from '@chakra-ui/react'

function RulesModal({isOpen, onOpen, onClose}) {
    return (
        <Modal blockScrollOnMount={false} size ={'lg'} isOpen={isOpen} onClose={onClose}>
            <ModalOverlay/>
            <ModalContent>
                <ModalHeader>Rules</ModalHeader>
                <ModalCloseButton color="black"/>
                <ModalBody>
                    <Tabs variant='enclosed'>
                        <TabList>
                            <Tab>How to Play</Tab>
                            <Tab>Scoring</Tab>
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
                        </TabPanels>
                    </Tabs>
                </ModalBody>
                <ModalFooter/>
            </ModalContent>
        </Modal>
    )
}

export default RulesModal;