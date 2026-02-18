'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Vote,
  Plus,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  BarChart3,
} from 'lucide-react'

const mockPolls = {
  active: [
    {
      id: '1',
      title: 'Committee Election 2026-27',
      description: 'Vote for the new managing committee members for the term 2026-27',
      type: 'ELECTION',
      startDate: '2026-02-15',
      endDate: '2026-02-28',
      isAnonymous: true,
      totalVotes: 420,
      totalEligible: 650,
      hasVoted: false,
      options: [
        { id: 'o1', optionText: 'Mr. Rajesh Sharma (President)', votes: 180 },
        { id: 'o2', optionText: 'Mrs. Priya Patel (President)', votes: 150 },
        { id: 'o3', optionText: 'Mr. Amit Kumar (President)', votes: 90 },
      ],
    },
    {
      id: '2',
      title: 'Swimming Pool Timing Change',
      description: 'Should we extend swimming pool hours to 9 PM on weekends?',
      type: 'POLL',
      startDate: '2026-02-10',
      endDate: '2026-02-20',
      isAnonymous: false,
      totalVotes: 380,
      totalEligible: 650,
      hasVoted: true,
      options: [
        { id: 'o1', optionText: 'Yes, extend to 9 PM', votes: 245 },
        { id: 'o2', optionText: 'No, keep current timing', votes: 135 },
      ],
    },
    {
      id: '3',
      title: 'New CCTV Installation',
      description: 'Approve budget of ₹5 Lakhs for installing additional CCTV cameras in parking areas',
      type: 'POLL',
      startDate: '2026-02-12',
      endDate: '2026-02-22',
      isAnonymous: false,
      totalVotes: 290,
      totalEligible: 650,
      hasVoted: false,
      options: [
        { id: 'o1', optionText: 'Approve', votes: 0 },
        { id: 'o2', optionText: 'Reject', votes: 0 },
        { id: 'o3', optionText: 'Need more information', votes: 0 },
      ],
    },
  ],
  closed: [
    {
      id: '4',
      title: 'Garden Renovation Project',
      description: 'Approve garden renovation with new seating and landscaping',
      type: 'POLL',
      startDate: '2026-01-15',
      endDate: '2026-01-25',
      isAnonymous: false,
      totalVotes: 520,
      totalEligible: 650,
      result: 'Approved with 78% votes',
      options: [
        { id: 'o1', optionText: 'Approve', votes: 406 },
        { id: 'o2', optionText: 'Reject', votes: 114 },
      ],
    },
    {
      id: '5',
      title: 'Maintenance Charge Revision',
      description: '10% increase in maintenance charges effective April 2026',
      type: 'POLL',
      startDate: '2026-01-01',
      endDate: '2026-01-10',
      isAnonymous: true,
      totalVotes: 580,
      totalEligible: 650,
      result: 'Approved with 65% votes',
      options: [
        { id: 'o1', optionText: 'Approve 10% increase', votes: 377 },
        { id: 'o2', optionText: 'Approve 5% increase', votes: 145 },
        { id: 'o3', optionText: 'No increase', votes: 58 },
      ],
    },
  ],
}

export default function VotingPage() {
  const { data: session } = useSession()
  const [selectedOption, setSelectedOption] = useState('')
  const [voteDialogOpen, setVoteDialogOpen] = useState(false)
  const [selectedPoll, setSelectedPoll] = useState<typeof mockPolls.active[0] | null>(null)
  const [createPollOpen, setCreatePollOpen] = useState(false)

  const isCommittee = session?.user?.role === 'ADMIN' || session?.user?.role === 'COMMITTEE'

  const handleVote = (poll: typeof mockPolls.active[0]) => {
    setSelectedPoll(poll)
    setSelectedOption('')
    setVoteDialogOpen(true)
  }

  const submitVote = () => {
    // API call would go here
    console.log('Voting for:', selectedOption, 'in poll:', selectedPoll?.id)
    setVoteDialogOpen(false)
    setSelectedPoll(null)
    setSelectedOption('')
  }

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  const getParticipationRate = (votes: number, eligible: number) => {
    return Math.round((votes / eligible) * 100)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Voting & Polls</h1>
          <p className="text-muted-foreground">
            Participate in society decisions through transparent voting
          </p>
        </div>
        {isCommittee && (
          <Dialog open={createPollOpen} onOpenChange={setCreatePollOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Poll
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Create New Poll</DialogTitle>
                <DialogDescription>
                  Create a new poll or election for society members
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Poll Title</Label>
                  <Input id="title" placeholder="Enter poll title" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Describe what residents are voting on" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input id="startDate" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input id="endDate" type="date" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Options</Label>
                  <div className="space-y-2">
                    <Input placeholder="Option 1" />
                    <Input placeholder="Option 2" />
                    <Input placeholder="Option 3 (optional)" />
                  </div>
                  <Button type="button" variant="outline" size="sm">
                    + Add Option
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="anonymous" className="rounded border-gray-300" />
                  <Label htmlFor="anonymous">Anonymous voting</Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setCreatePollOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Poll</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Polls
            </CardTitle>
            <Vote className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockPolls.active.length}</div>
            <p className="text-xs text-muted-foreground">Voting in progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Your Pending Votes
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockPolls.active.filter((p) => !p.hasVoted).length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting your vote</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Polls
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockPolls.active.length + mockPolls.closed.length}
            </div>
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            Active Polls ({mockPolls.active.length})
          </TabsTrigger>
          <TabsTrigger value="closed">
            Past Results ({mockPolls.closed.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockPolls.active.map((poll) => {
              const daysRemaining = getDaysRemaining(poll.endDate)
              const participation = getParticipationRate(poll.totalVotes, poll.totalEligible)

              return (
                <Card key={poll.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Badge variant={poll.type === 'ELECTION' ? 'default' : 'secondary'}>
                        {poll.type}
                      </Badge>
                      {poll.hasVoted && (
                        <Badge variant="outline" className="text-green-600">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Voted
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="mt-2">{poll.title}</CardTitle>
                    <CardDescription>{poll.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Ending today'}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            Participation
                          </span>
                          <span className="font-medium">{participation}%</span>
                        </div>
                        <Progress value={participation} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {poll.totalVotes} of {poll.totalEligible} flats voted
                        </p>
                      </div>
                      {poll.isAnonymous && (
                        <Badge variant="outline" className="text-xs">
                          Anonymous Voting
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    {poll.hasVoted ? (
                      <Button variant="outline" className="w-full" disabled>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Already Voted
                      </Button>
                    ) : (
                      <Button className="w-full" onClick={() => handleVote(poll)}>
                        <Vote className="mr-2 h-4 w-4" />
                        Cast Your Vote
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="closed" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {mockPolls.closed.map((poll) => {
              const participation = getParticipationRate(poll.totalVotes, poll.totalEligible)
              const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0)

              return (
                <Card key={poll.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Badge variant="secondary">{poll.type}</Badge>
                      <Badge variant="outline">Closed</Badge>
                    </div>
                    <CardTitle className="mt-2">{poll.title}</CardTitle>
                    <CardDescription>{poll.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="rounded-lg bg-green-50 p-3 text-green-800">
                        <p className="font-medium">{poll.result}</p>
                      </div>
                      <div className="space-y-3">
                        {poll.options.map((option) => {
                          const percentage = Math.round((option.votes / totalVotes) * 100)
                          return (
                            <div key={option.id} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>{option.optionText}</span>
                                <span className="font-medium">{percentage}%</span>
                              </div>
                              <Progress value={percentage} className="h-2" />
                              <p className="text-xs text-muted-foreground">
                                {option.votes} votes
                              </p>
                            </div>
                          )
                        })}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {participation}% participation
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(poll.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Vote Dialog */}
      <Dialog open={voteDialogOpen} onOpenChange={setVoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedPoll?.title}</DialogTitle>
            <DialogDescription>{selectedPoll?.description}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
              {selectedPoll?.options.map((option) => (
                <div key={option.id} className="flex items-center space-x-2 rounded-lg border p-4">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                    {option.optionText}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {selectedPoll?.isAnonymous && (
              <p className="mt-4 text-sm text-muted-foreground">
                This is an anonymous poll. Your identity will not be recorded with your vote.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVoteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitVote} disabled={!selectedOption}>
              Submit Vote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
