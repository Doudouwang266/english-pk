import type { FastifyInstance } from 'fastify'
import { supabaseAdmin } from '../supabase/client.js'

interface QuestionSeed {
  type: string
  difficulty: string
  stem: string
  options: string[]
  correct_index: number
  explanation: string
  time_limit_ms: number
  tags: string[]
}

function generateQuestions(): QuestionSeed[] {
  const questions: QuestionSeed[] = []

  // Easy vocabulary (30)
  const easyVocab: [string, string, string[]][] = [
    ['"Happy" means:', 'B. Joyful', ['A. Sad', 'B. Joyful', 'C. Angry', 'D. Tired']],
    ['"Big" means:', 'B. Large', ['A. Small', 'B. Large', 'C. Tall', 'D. Thin']],
    ['"Beautiful" means:', 'B. Pretty', ['A. Ugly', 'B. Pretty', 'C. Boring', 'D. Strange']],
    ['"Quick" means:', 'C. Fast', ['A. Slow', 'B. Heavy', 'C. Fast', 'D. Quiet']],
    ['"Begin" means:', 'C. Start', ['A. End', 'B. Stop', 'C. Start', 'D. Pause']],
    ['"Smart" means:', 'B. Intelligent', ['A. Foolish', 'B. Intelligent', 'C. Weak', 'D. Slow']],
    ['"Silent" means:', 'C. Quiet', ['A. Loud', 'B. Noisy', 'C. Quiet', 'D. Busy']],
    ['"Wealthy" means:', 'C. Rich', ['A. Poor', 'B. Healthy', 'C. Rich', 'D. Happy']],
    ['"Ancient" means:', 'C. Old', ['A. New', 'B. Young', 'C. Old', 'D. Modern']],
    ['"Courage" means:', 'B. Bravery', ['A. Fear', 'B. Bravery', 'C. Weakness', 'D. Laziness']],
    ['"Furious" means:', 'C. Very angry', ['A. Calm', 'B. Happy', 'C. Very angry', 'D. Sad']],
    ['"Enormous" means:', 'C. Very large', ['A. Tiny', 'B. Normal', 'C. Very large', 'D. Strange']],
    ['"Delicious" means:', 'B. Tasty', ['A. Terrible', 'B. Tasty', 'C. Bitter', 'D. Plain']],
    ['"Fragile" means:', 'C. Easily broken', ['A. Strong', 'B. Heavy', 'C. Easily broken', 'D. Flexible']],
    ['"Patient" means:', 'B. Able to wait', ['A. In a hurry', 'B. Able to wait', 'C. Angry', 'D. Sick']],
    ['"Generous" means:', 'C. Willing to give', ['A. Selfish', 'B. Greedy', 'C. Willing to give', 'D. Poor']],
    ['"Ordinary" means:', 'C. Common', ['A. Special', 'B. Unusual', 'C. Common', 'D. Rare']],
    ['"Polite" means:', 'B. Respectful', ['A. Rude', 'B. Respectful', 'C. Loud', 'D. Shy']],
    ['"Accurate" means:', 'C. Exact', ['A. Wrong', 'B. Approximate', 'C. Exact', 'D. False']],
    ['"Frequently" means:', 'C. Often', ['A. Rarely', 'B. Never', 'C. Often', 'D. Sometimes']],
    ['"Beneath" means:', 'B. Under', ['A. Above', 'B. Under', 'C. Beside', 'D. Beyond']],
    ['"Purchase" means:', 'A. Buy', ['A. Buy', 'B. Sell', 'C. Rent', 'D. Borrow']],
    ['"Assist" means:', 'C. Help', ['A. Hinder', 'B. Ignore', 'C. Help', 'D. Teach']],
    ['"Permit" means:', 'B. Allow', ['A. Forbid', 'B. Allow', 'C. Force', 'D. Suggest']],
    ['"Entire" means:', 'A. Whole', ['A. Whole', 'B. Partial', 'C. Broken', 'D. Empty']],
    ['"Precious" means:', 'D. Valuable', ['A. Cheap', 'B. Common', 'C. Useless', 'D. Valuable']],
    ['"Brief" means:', 'B. Short', ['A. Long', 'B. Short', 'C. Detailed', 'D. Boring']],
    ['"Obtain" means:', 'A. Get', ['A. Get', 'B. Lose', 'C. Give', 'D. Make']],
    ['"Vacant" means:', 'D. Empty', ['A. Full', 'B. Busy', 'C. Crowded', 'D. Empty']],
    ['"Eternal" means:', 'C. Forever', ['A. Temporary', 'B. Brief', 'C. Forever', 'D. Recent']],
    ['"Neat" means:', 'A. Tidy', ['A. Tidy', 'B. Messy', 'C. Dirty', 'D. Large']],
    ['"Damp" means:', 'B. Slightly wet', ['A. Completely dry', 'B. Slightly wet', 'C. Very hot', 'D. Frozen']],
    ['"Slender" means:', 'D. Thin', ['A. Fat', 'B. Short', 'C. Wide', 'D. Thin']],
    ['"Annual" means:', 'C. Yearly', ['A. Monthly', 'B. Weekly', 'C. Yearly', 'D. Daily']],
    ['"Vacant" means:', 'A. Empty', ['A. Empty', 'B. Full', 'C. Busy', 'D. Crowded']]
  ]

  // Medium vocabulary (20)
  const medVocab: [string, string, string[]][] = [
    ['"Eloquent" means:', 'A. Fluent and persuasive', ['A. Fluent and persuasive', 'B. Quiet and shy', 'C. Angry and loud', 'D. Slow and careful']],
    ['"Benevolent" means:', 'B. Kind and generous', ['A. Cruel and mean', 'B. Kind and generous', 'C. Rich and powerful', 'D. Poor and humble']],
    ['"Meticulous" means:', 'D. Very careful and precise', ['A. Careless', 'B. Quick', 'C. Lazy', 'D. Very careful and precise']],
    ['"Abundant" means:', 'A. Plentiful', ['A. Plentiful', 'B. Scarce', 'C. Expensive', 'D. Beautiful']],
    ['"Candid" means:', 'C. Honest and direct', ['A. Dishonest', 'B. Secretive', 'C. Honest and direct', 'D. Confused']],
    ['"Diligent" means:', 'B. Hardworking', ['A. Lazy', 'B. Hardworking', 'C. Intelligent', 'D. Quick']],
    ['"Feeble" means:', 'D. Weak', ['A. Strong', 'B. Brave', 'C. Clever', 'D. Weak']],
    ['"Genuine" means:', 'A. Real and authentic', ['A. Real and authentic', 'B. Fake', 'C. Expensive', 'D. Common']],
    ['"Hostile" means:', 'C. Unfriendly and aggressive', ['A. Friendly', 'B. Peaceful', 'C. Unfriendly and aggressive', 'D. Shy']],
    ['"Immense" means:', 'B. Extremely large', ['A. Very small', 'B. Extremely large', 'C. Average sized', 'D. Very heavy']],
    ['"Jubilant" means:', 'D. Extremely happy', ['A. Very sad', 'B. Moderately pleased', 'C. Calm', 'D. Extremely happy']],
    ['"Keen" means:', 'A. Eager and enthusiastic', ['A. Eager and enthusiastic', 'B. Reluctant', 'C. Bored', 'D. Confused']],
    ['"Lavish" means:', 'C. Luxurious and extravagant', ['A. Plain', 'B. Cheap', 'C. Luxurious and extravagant', 'D. Simple']],
    ['"Modest" means:', 'B. Humble and unassuming', ['A. Arrogant', 'B. Humble and unassuming', 'C. Rich', 'D. Famous']],
    ['"Novice" means:', 'D. Beginner', ['A. Expert', 'B. Teacher', 'C. Professional', 'D. Beginner']],
    ['"Optimistic" means:', 'A. Hopeful about the future', ['A. Hopeful about the future', 'B. Pessimistic', 'C. Realistic', 'D. Depressed']],
    ['"Persistent" means:', 'C. Continuing firmly', ['A. Giving up easily', 'B. Changing often', 'C. Continuing firmly', 'D. Delaying always']],
    ['"Reluctant" means:', 'B. Unwilling and hesitant', ['A. Eager', 'B. Unwilling and hesitant', 'C. Quick', 'D. Happy']],
    ['"Spontaneous" means:', 'D. Unplanned and impulsive', ['A. Careful', 'B. Planned', 'C. Deliberate', 'D. Unplanned and impulsive']],
    ['"Tedious" means:', 'A. Boring and repetitive', ['A. Boring and repetitive', 'B. Exciting', 'C. Quick', 'D. Important']],
    ['"Versatile" means:', 'D. Able to adapt to many functions', ['A. Limited', 'B. Specialized', 'C. Inflexible', 'D. Able to adapt to many functions']],
    ['"Inevitable" means:', 'B. Certain to happen', ['A. Avoidable', 'B. Certain to happen', 'C. Unlikely', 'D. Optional']],
    ['"Subtle" means:', 'A. Delicate and understated', ['A. Delicate and understated', 'B. Obvious', 'C. Blunt', 'D. Harsh']],
    ['"Vivid" means:', 'C. Bright and clear', ['A. Dull', 'B. Dark', 'C. Bright and clear', 'D. Faint']]
  ]

  // Hard vocabulary (15)
  const hardVocab: [string, string, string[]][] = [
    ['"Ephemeral" means:', 'C. Lasting a very short time', ['A. Eternal', 'B. Permanent', 'C. Lasting a very short time', 'D. Changing slowly']],
    ['"Ubiquitous" means:', 'A. Found everywhere', ['A. Found everywhere', 'B. Very rare', 'C. Hidden', 'D. Unique']],
    ['"Pragmatic" means:', 'B. Practical and realistic', ['A. Idealistic', 'B. Practical and realistic', 'C. Theoretical', 'D. Emotional']],
    ['"Sycophant" means:', 'D. A flatterer seeking favor', ['A. An honest critic', 'B. A loyal friend', 'C. A brave leader', 'D. A flatterer seeking favor']],
    ['"Pernicious" means:', 'C. Having a harmful effect', ['A. Beneficial', 'B. Neutral', 'C. Having a harmful effect', 'D. Temporary']],
    ['"Ameliorate" means:', 'A. To make better', ['A. To make better', 'B. To make worse', 'C. To ignore', 'D. To destroy']],
    ['"Loquacious" means:', 'B. Very talkative', ['A. Quiet', 'B. Very talkative', 'C. Angry', 'D. Shy']],
    ['"Obsequious" means:', 'D. Excessively obedient', ['A. Rebellious', 'B. Independent', 'C. Proud', 'D. Excessively obedient']],
    ['"Taciturn" means:', 'C. Reserved and uncommunicative', ['A. Talkative', 'B. Friendly', 'C. Reserved and uncommunicative', 'D. Angry']],
    ['"Magnanimous" means:', 'A. Very generous and forgiving', ['A. Very generous and forgiving', 'B. Petty and mean', 'C. Rich and famous', 'D. Quiet and shy']],
    ['"Recalcitrant" means:', 'B. Stubbornly uncooperative', ['A. Cooperative', 'B. Stubbornly uncooperative', 'C. Enthusiastic', 'D. Intelligent']],
    ['"Perspicacious" means:', 'D. Having keen insight', ['A. Confused', 'B. Slow to understand', 'C. Forgetful', 'D. Having keen insight']],
    ['"Obstreperous" means:', 'A. Noisy and difficult to control', ['A. Noisy and difficult to control', 'B. Quiet and calm', 'C. Happy and content', 'D. Weak and fragile']],
    ['"Pusillanimous" means:', 'C. Cowardly and timid', ['A. Brave', 'B. Bold', 'C. Cowardly and timid', 'D. Strong']],
    ['"Vicissitude" means:', 'B. A change of circumstances', ['A. Stability', 'B. A change of circumstances', 'C. A type of food', 'D. A celebration']]
  ]

  // Easy grammar (25)
  const easyGrammar: [string, string, string[]][] = [
    ['I ___ a student.', 'A. am', ['A. am', 'B. is', 'C. are', 'D. be']],
    ['She ___ to school every day.', 'B. goes', ['A. go', 'B. goes', 'C. going', 'D. gone']],
    ['They ___ playing football now.', 'C. are', ['A. is', 'B. am', 'C. are', 'D. be']],
    ['He ___ breakfast this morning.', 'D. ate', ['A. eat', 'B. eats', 'C. eating', 'D. ate']],
    ['___ you like coffee?', 'A. Do', ['A. Do', 'B. Does', 'C. Is', 'D. Are']],
    ['There ___ many books on the desk.', 'B. are', ['A. is', 'B. are', 'C. am', 'D. be']],
    ['I have ___ finished my homework.', 'C. already', ['A. yet', 'B. since', 'C. already', 'D. for']],
    ['She is ___ than her sister.', 'A. taller', ['A. taller', 'B. tall', 'C. tallest', 'D. more tall']],
    ['We ___ to the park yesterday.', 'B. went', ['A. go', 'B. went', 'C. gone', 'D. going']],
    ['___ book is on the table?', 'C. Whose', ['A. Who', 'B. Whom', 'C. Whose', 'D. Which']],
    ['He can ___ English very well.', 'D. speak', ['A. speaks', 'B. spoke', 'C. spoken', 'D. speak']],
    ['I ___ TV when she called.', 'B. was watching', ['A. watched', 'B. was watching', 'C. watch', 'D. have watched']],
    ['She ___ never been to Beijing.', 'C. has', ['A. have', 'B. is', 'C. has', 'D. was']],
    ['It is ___ interesting book.', 'A. an', ['A. an', 'B. a', 'C. the', 'D. no article']],
    ['Would you like ___ tea?', 'B. some', ['A. any', 'B. some', 'C. a', 'D. an']],
    ['How ___ does it cost?', 'D. much', ['A. many', 'B. long', 'C. far', 'D. much']],
    ['I look forward to ___ you.', 'C. seeing', ['A. see', 'B. seen', 'C. seeing', 'D. saw']],
    ['Neither he nor I ___ there.', 'A. am', ['A. am', 'B. is', 'C. are', 'D. be']],
    ['The meeting ___ at 3 PM.', 'B. starts', ['A. start', 'B. starts', 'C. starting', 'D. started']],
    ['If it ___, we will stay home.', 'C. rains', ['A. rain', 'B. rained', 'C. rains', 'D. raining']],
    ['She asked me ___ I was okay.', 'A. if', ['A. if', 'B. that', 'C. what', 'D. which']],
    ['I wish I ___ a bird.', 'B. were', ['A. am', 'B. were', 'C. was', 'D. be']],
    ['Not only the students but also the teacher ___ present.', 'C. is', ['A. are', 'B. were', 'C. is', 'D. am']],
    ['By the time he arrives, we ___ for two hours.', 'D. will have been waiting', ['A. waited', 'B. wait', 'C. are waiting', 'D. will have been waiting']],
    ['She is the girl ___ brother is a doctor.', 'B. whose', ['A. who', 'B. whose', 'C. whom', 'D. which']],
    ['___ sun rises in the east.', 'A. The', ['A. The', 'B. A', 'C. An', 'D. No article']],
    ['He is ___ than his brother.', 'B. taller', ['A. tall', 'B. taller', 'C. tallest', 'D. more tall']],
    ['I ___ my keys. I cannot find them.', 'C. have lost', ['A. lose', 'B. lost', 'C. have lost', 'D. am losing']],
    ['We ___ visit our grandparents next week.', 'D. will', ['A. are', 'B. do', 'C. have', 'D. will']]
  ]

  // Medium grammar (15)
  const medGrammar: [string, string, string[]][] = [
    ['Had I known, I ___ come earlier.', 'B. would have', ['A. will have', 'B. would have', 'C. had', 'D. have']],
    ['It is high time we ___ action.', 'C. took', ['A. take', 'B. taken', 'C. took', 'D. taking']],
    ['Seldom ___ such a beautiful sight.', 'A. have I seen', ['A. have I seen', 'B. I have seen', 'C. I saw', 'D. did I saw']],
    ['The more you practice, ___ you become.', 'D. the better', ['A. better', 'B. the best', 'C. more better', 'D. the better']],
    ['I would rather you ___ here tomorrow.', 'B. came', ['A. come', 'B. came', 'C. coming', 'D. will come']],
    ['___ the weather, the event was a success.', 'C. Despite', ['A. Although', 'B. Because of', 'C. Despite', 'D. However']],
    ['Not until she spoke ___ realize she was English.', 'A. did I', ['A. did I', 'B. I did', 'C. I had', 'D. had I']],
    ['The house needs ___.', 'B. painting', ['A. to paint', 'B. painting', 'C. painted', 'D. paint']],
    ['It is essential that he ___ on time.', 'D. be', ['A. is', 'B. was', 'C. will be', 'D. be']],
    ['No sooner had he arrived ___ it started raining.', 'A. than', ['A. than', 'B. when', 'C. then', 'D. that']],
    ['He denied ___ the money.', 'C. having stolen', ['A. to steal', 'B. steal', 'C. having stolen', 'D. stole']],
    ['But for your help, I ___ the exam.', 'B. would have failed', ['A. will fail', 'B. would have failed', 'C. failed', 'D. had failed']],
    ['She insisted that he ___ present.', 'A. be', ['A. be', 'B. is', 'C. was', 'D. being']],
    ['___ as it may seem, it is true.', 'C. Strange', ['A. Strangely', 'B. More strange', 'C. Strange', 'D. The strangest']],
    ['He is second to ___ in mathematics.', 'B. none', ['A. anyone', 'B. none', 'C. nobody', 'D. someone']]
  ]

  // Hard grammar (10)
  const hardGrammar: [string, string, string[]][] = [
    ['Were it not for his help, I ___ now.', 'D. would not be here', ['A. am not here', 'B. was not here', 'C. will not be', 'D. would not be here']],
    ['The subjunctive mood requires that every student ___ the assignment.', 'A. submit', ['A. submit', 'B. submits', 'C. submitted', 'D. will submit']],
    ['Scarcely ___ the room when the phone rang.', 'B. had I entered', ['A. I had entered', 'B. had I entered', 'C. I entered', 'D. entered I']],
    ['To ___ should I address this letter?', 'C. whom', ['A. who', 'B. which', 'C. whom', 'D. whose']],
    ['The data ___ been analyzed thoroughly.', 'B. have', ['A. has', 'B. have', 'C. is', 'D. was']],
    ['Under no circumstances ___ be late.', 'A. should you', ['A. should you', 'B. you should', 'C. you would', 'D. will you']],
    ['I appreciate ___ given this opportunity.', 'C. having been', ['A. to be', 'B. being', 'C. having been', 'D. to have been']],
    ['Each of the participants ___ a certificate.', 'A. receives', ['A. receives', 'B. receive', 'C. receiving', 'D. have received']],
    ['The committee ___ divided in their opinions.', 'B. are', ['A. is', 'B. are', 'C. was', 'D. has been']],
    ['It was not until the 19th century that women ___ the right to vote.', 'C. gained', ['A. gain', 'B. had gained', 'C. gained', 'D. have gained']]
  ]

  // Easy translation (15)
  const easyTrans: [string, string, string[]][] = [
    ['"苹果" in English is:', 'A. Apple', ['A. Apple', 'B. Orange', 'C. Banana', 'D. Grape']],
    ['"书" in English is:', 'B. Book', ['A. Pen', 'B. Book', 'C. Paper', 'D. Desk']],
    ['"猫" in English is:', 'C. Cat', ['A. Dog', 'B. Bird', 'C. Cat', 'D. Fish']],
    ['"水" in English is:', 'D. Water', ['A. Fire', 'B. Air', 'C. Earth', 'D. Water']],
    ['"朋友" in English is:', 'A. Friend', ['A. Friend', 'B. Family', 'C. Enemy', 'D. Teacher']],
    ['"学校" in English is:', 'B. School', ['A. Hospital', 'B. School', 'C. Library', 'D. Office']],
    ['"医生" in English is:', 'C. Doctor', ['A. Teacher', 'B. Lawyer', 'C. Doctor', 'D. Nurse']],
    ['"音乐" in English is:', 'D. Music', ['A. Art', 'B. Dance', 'C. Movie', 'D. Music']],
    ['"重要" in English is:', 'A. Important', ['A. Important', 'B. Difficult', 'C. Easy', 'D. Interesting']],
    ['"机会" in English is:', 'B. Opportunity', ['A. Problem', 'B. Opportunity', 'C. Challenge', 'D. Solution']],
    ['"经验" in English is:', 'C. Experience', ['A. Education', 'B. Knowledge', 'C. Experience', 'D. Skill']],
    ['"成功" in English is:', 'D. Success', ['A. Failure', 'B. Victory', 'C. Achievement', 'D. Success']],
    ['"环境" in English is:', 'A. Environment', ['A. Environment', 'B. Nature', 'C. Weather', 'D. Climate']],
    ['"文化" in English is:', 'B. Culture', ['A. History', 'B. Culture', 'C. Tradition', 'D. Custom']],
    ['"健康" in English is:', 'C. Health', ['A. Wealth', 'B. Happiness', 'C. Health', 'D. Fitness']]
  ]

  // Medium translation (10)
  const medTrans: [string, string, string[]][] = [
    ['"勉为其难" most likely means:', 'B. Do something against one\'s will', ['A. Work hard willingly', 'B. Do something against one\'s will', 'C. Help others happily', 'D. Finish tasks quickly']],
    ['"脱颖而出" in English is closest to:', 'C. Stand out from the crowd', ['A. Fall behind', 'B. Escape danger', 'C. Stand out from the crowd', 'D. Move forward']],
    ['"实事求是" means:', 'A. Be practical and realistic', ['A. Be practical and realistic', 'B. Tell lies', 'C. Be imaginative', 'D. Follow rules blindly']],
    ['"未雨绸缪" means:', 'D. Prepare before it rains', ['A. Act after the fact', 'B. Wait for instructions', 'C. Rely on luck', 'D. Prepare before it rains']],
    ['"事半功倍" means:', 'B. Get twice the result with half the effort', ['A. Work twice as hard', 'B. Get twice the result with half the effort', 'C. Fail despite effort', 'D. Take twice as long']],
    ['"画蛇添足" means:', 'C. Add unnecessary details that spoil the effect', ['A. Improve a painting', 'B. Create art carefully', 'C. Add unnecessary details that spoil the effect', 'D. Finish work perfectly']],
    ['"半途而废" means:', 'A. Give up halfway', ['A. Give up halfway', 'B. Complete fully', 'C. Rest in between', 'D. Start over again']],
    ['"一见钟情" means:', 'D. Love at first sight', ['A. Friendship forever', 'B. Hate at first meeting', 'C. Meet by chance', 'D. Love at first sight']],
    ['"胸有成竹" means:', 'B. Have a well-thought-out plan', ['A. Be confused', 'B. Have a well-thought-out plan', 'C. Draw bamboo well', 'D. Be physically strong']],
    ['"对牛弹琴" means:', 'C. Cast pearls before swine', ['A. Play music for animals', 'B. Teach effectively', 'C. Cast pearls before swine', 'D. Communicate clearly']]
  ]

  // Hard translation (10)
  const hardTrans: [string, string, string[]][] = [
    ['"饮鸩止渴" means:', 'A. Seek temporary relief regardless of consequences', ['A. Seek temporary relief regardless of consequences', 'B. Drink when thirsty', 'C. Find a permanent solution', 'D. Quench thirst with poison']],
    ['"纸上谈兵" means:', 'B. Empty theoretical talk', ['A. Write military strategy', 'B. Empty theoretical talk', 'C. Practical experience', 'D. Study hard']],
    ['"班门弄斧" means:', 'D. Show off in front of an expert', ['A. Teach a beginner', 'B. Learn from a master', 'C. Practice diligently', 'D. Show off in front of an expert']],
    ['"杯弓蛇影" means:', 'C. Be paranoid and suspicious', ['A. Drink wine carefully', 'B. See things clearly', 'C. Be paranoid and suspicious', 'D. Hunt snakes']],
    ['"破釜沉舟" means:', 'A. Burn one\'s boats / commit irrevocably', ['A. Burn one\'s boats / commit irrevocably', 'B. Start a new journey', 'C. Destroy old equipment', 'D. Give up halfway']],
    ['"掩耳盗铃" means:', 'B. Deceive oneself', ['A. Steal a bell', 'B. Deceive oneself', 'C. Cover one\'s ears', 'D. Listen carefully']],
    ['"亡羊补牢" means:', 'D. Mend the fold after a sheep is lost', ['A. Give up after a loss', 'B. Count sheep carefully', 'C. Ignore problems', 'D. Mend the fold after a sheep is lost']],
    ['"守株待兔" means:', 'C. Wait idly for opportunities', ['A. Hunt rabbits actively', 'B. Protect one\'s garden', 'C. Wait idly for opportunities', 'D. Be patient']],
    ['"刻舟求剑" means:', 'A. Use outdated methods', ['A. Use outdated methods', 'B. Carve a boat skillfully', 'C. Search for lost items', 'D. Make swords']],
    ['"叶公好龙" means:', 'B. Pretend to like something one actually fears', ['A. Love dragons genuinely', 'B. Pretend to like something one actually fears', 'C. Collect rare items', 'D. Tell stories about dragons']]
  ]

  // Easy synonym (15)
  const easySyn: [string, string, string[]][] = [
    ['Synonym of "happy":', 'C. Glad', ['A. Sad', 'B. Tired', 'C. Glad', 'D. Angry']],
    ['Synonym of "fast":', 'A. Quick', ['A. Quick', 'B. Slow', 'C. Heavy', 'D. Light']],
    ['Synonym of "angry":', 'B. Mad', ['A. Calm', 'B. Mad', 'C. Happy', 'D. Scared']],
    ['Synonym of "pretty":', 'D. Beautiful', ['A. Ugly', 'B. Plain', 'C. Strange', 'D. Beautiful']],
    ['Synonym of "smart":', 'A. Clever', ['A. Clever', 'B. Foolish', 'C. Lazy', 'D. Slow']],
    ['Synonym of "brave":', 'C. Courageous', ['A. Cowardly', 'B. Timid', 'C. Courageous', 'D. Weak']],
    ['Synonym of "tiny":', 'B. Small', ['A. Large', 'B. Small', 'C. Heavy', 'D. Wide']],
    ['Synonym of "wealthy":', 'D. Rich', ['A. Poor', 'B. Famous', 'C. Healthy', 'D. Rich']],
    ['Synonym of "begin":', 'A. Start', ['A. Start', 'B. End', 'C. Stop', 'D. Delay']],
    ['Synonym of "assist":', 'C. Help', ['A. Hinder', 'B. Stop', 'C. Help', 'D. Ignore']],
    ['Synonym of "calm":', 'B. Peaceful', ['A. Angry', 'B. Peaceful', 'C. Excited', 'D. Nervous']],
    ['Synonym of "correct":', 'D. Right', ['A. Wrong', 'B. False', 'C. Left', 'D. Right']],
    ['Synonym of "quiet":', 'A. Silent', ['A. Silent', 'B. Loud', 'C. Noisy', 'D. Talkative']],
    ['Synonym of "strong":', 'C. Powerful', ['A. Weak', 'B. Frail', 'C. Powerful', 'D. Gentle']],
    ['Synonym of "sad":', 'B. Unhappy', ['A. Joyful', 'B. Unhappy', 'C. Pleased', 'D. Excited']],
    ['Synonym of "angry":', 'D. Furious', ['A. Happy', 'B. Calm', 'C. Tired', 'D. Furious']],
    ['Synonym of "big":', 'A. Large', ['A. Large', 'B. Small', 'C. Quick', 'D. Light']],
    ['Synonym of "love":', 'C. Adore', ['A. Hate', 'B. Dislike', 'C. Adore', 'D. Ignore']],
    ['Synonym of "tired":', 'B. Exhausted', ['A. Energetic', 'B. Exhausted', 'C. Awake', 'D. Active']]
  ]

  // Medium synonym (10)
  const medSyn: [string, string, string[]][] = [
    ['Synonym of "benevolent":', 'A. Charitable', ['A. Charitable', 'B. Greedy', 'C. Malicious', 'D. Selfish']],
    ['Synonym of "meticulous":', 'C. Thorough', ['A. Careless', 'B. Slovenly', 'C. Thorough', 'D. Quick']],
    ['Synonym of "eloquent":', 'D. Articulate', ['A. Inarticulate', 'B. Quiet', 'C. Shy', 'D. Articulate']],
    ['Synonym of "hostile":', 'B. Antagonistic', ['A. Friendly', 'B. Antagonistic', 'C. Welcoming', 'D. Warm']],
    ['Synonym of "abundant":', 'A. Copious', ['A. Copious', 'B. Scarce', 'C. Rare', 'D. Meager']],
    ['Synonym of "candid":', 'C. Frank', ['A. Dishonest', 'B. Deceptive', 'C. Frank', 'D. Evasive']],
    ['Synonym of "diligent":', 'D. Industrious', ['A. Lazy', 'B. Idle', 'C. Negligent', 'D. Industrious']],
    ['Synonym of "feeble":', 'B. Frail', ['A. Strong', 'B. Frail', 'C. Robust', 'D. Vigorous']],
    ['Synonym of "genuine":', 'A. Authentic', ['A. Authentic', 'B. Fake', 'C. Forged', 'D. Artificial']],
    ['Synonym of "immense":', 'C. Vast', ['A. Tiny', 'B. Minute', 'C. Vast', 'D. Limited']]
  ]

  // Hard synonym (5)
  const hardSyn: [string, string, string[]][] = [
    ['Synonym of "ephemeral":', 'B. Transient', ['A. Eternal', 'B. Transient', 'C. Permanent', 'D. Lasting']],
    ['Synonym of "loquacious":', 'A. Garrulous', ['A. Garrulous', 'B. Taciturn', 'C. Reticent', 'D. Silent']],
    ['Synonym of "pernicious":', 'C. Deleterious', ['A. Beneficial', 'B. Harmless', 'C. Deleterious', 'D. Helpful']],
    ['Synonym of "ameliorate":', 'D. Alleviate', ['A. Worsen', 'B. Aggravate', 'C. Exacerbate', 'D. Alleviate']],
    ['Synonym of "recalcitrant":', 'B. Obstreperous', ['A. Compliant', 'B. Obstreperous', 'C. Docile', 'D. Obedient']]
  ]

  // Easy reading (10)
  const easyReading: [string, string, string[]][] = [
    ['Tom has a dog named Max. Every morning, Tom takes Max for a walk in the park. Max loves to chase birds. What does Tom do every morning?', 'B. Walk his dog', ['A. Feed his cat', 'B. Walk his dog', 'C. Go to school', 'D. Read a book']],
    ['Lucy is a teacher. She works at a primary school. She teaches math to young children. She loves her job. What is Lucy\'s job?', 'A. Teacher', ['A. Teacher', 'B. Doctor', 'C. Lawyer', 'D. Nurse']],
    ['It was raining heavily. John forgot his umbrella. He got very wet on his way to work. Why did John get wet?', 'C. He forgot his umbrella', ['A. He liked rain', 'B. He went swimming', 'C. He forgot his umbrella', 'D. His umbrella was broken']],
    ['Sarah bought apples, bananas, and oranges at the store. She paid $20 and got $5 change. How much did she spend?', 'D. $15', ['A. $20', 'B. $25', 'C. $5', 'D. $15']],
    ['The library is closed on Sundays. It opens at 9 AM on weekdays and 10 AM on Saturdays. When does the library open on Wednesday?', 'B. 9 AM', ['A. 10 AM', 'B. 9 AM', 'C. 8 AM', 'D. It is closed']],
    ['Peter likes to play basketball after school. He practices every day. His dream is to become a professional player. What is Peter\'s dream?', 'C. To become a professional basketball player', ['A. To become a teacher', 'B. To go to college', 'C. To become a professional basketball player', 'D. To stop playing basketball']],
    ['Emily cooked dinner for her family. She made spaghetti, salad, and garlic bread. Everyone enjoyed the meal. What did Emily NOT make?', 'D. Pizza', ['A. Spaghetti', 'B. Salad', 'C. Garlic bread', 'D. Pizza']],
    ['The movie started at 7:00 PM and ended at 9:15 PM. How long was the movie?', 'A. 2 hours 15 minutes', ['A. 2 hours 15 minutes', 'B. 2 hours', 'C. 1 hour 45 minutes', 'D. 2 hours 30 minutes']],
    ['David is saving money for a new bicycle. The bicycle costs $240. He saves $30 each week. How many weeks will it take?', 'B. 8 weeks', ['A. 6 weeks', 'B. 8 weeks', 'C. 10 weeks', 'D. 12 weeks']],
    ['Anna has three children: two boys and one girl. Her oldest child is 10 and her youngest is 4. How many children does Anna have?', 'C. 3', ['A. 2', 'B. 4', 'C. 3', 'D. 5']]
  ]

  // Medium reading (10)
  const medReading: [string, string, string[]][] = [
    ['Climate change is causing sea levels to rise. Scientists predict that many coastal cities could face flooding problems by 2050. Governments are working on plans to reduce carbon emissions. What is the main concern in this passage?', 'B. Rising sea levels threatening coastal cities', ['A. More rain in cities', 'B. Rising sea levels threatening coastal cities', 'C. Too many people living near the sea', 'D. Carbon emissions increasing']],
    ['The Industrial Revolution began in Britain in the late 18th century. It transformed manufacturing from hand production to machine production. This led to urbanization as people moved to cities for factory jobs. What was a key effect of the Industrial Revolution?', 'C. People moved to cities', ['A. People returned to farms', 'B. Manufacturing decreased', 'C. People moved to cities', 'D. Machines became less important']],
    ['Artificial intelligence is being used in healthcare to diagnose diseases more accurately. AI algorithms can analyze medical images faster than humans. However, doctors emphasize that AI should assist, not replace, human judgment. What is the author\'s position on AI in healthcare?', 'A. AI should help doctors, not replace them', ['A. AI should help doctors, not replace them', 'B. AI should replace all doctors', 'C. AI is useless in healthcare', 'D. AI is already perfect']],
    ['The Amazon rainforest produces about 20% of the world\'s oxygen. Deforestation threatens this vital ecosystem. Scientists warn that losing the rainforest could accelerate global warming significantly. Why is the Amazon rainforest important?', 'D. It produces a large portion of Earth\'s oxygen', ['A. It provides timber for construction', 'B. It is a tourist destination', 'C. It has many animals', 'D. It produces a large portion of Earth\'s oxygen']],
    ['Studies show that regular exercise improves mental health. Physical activity releases endorphins that reduce stress and anxiety. Even 30 minutes of walking daily can make a significant difference. What benefit of exercise is mentioned?', 'B. It reduces stress', ['A. It makes you stronger', 'B. It reduces stress', 'C. It helps you lose weight', 'D. It improves sleep']],
    ['The Great Wall of China stretches over 13,000 miles. It was built over many centuries by different dynasties. Originally constructed for defense, it is now a UNESCO World Heritage site attracting millions of visitors. What was the original purpose of the Great Wall?', 'A. Military defense', ['A. Military defense', 'B. Tourism', 'C. Trade route', 'D. Religious worship']],
    ['Renewable energy sources like solar and wind are becoming cheaper than fossil fuels. Many countries are investing in green energy to meet climate goals. The transition could create millions of new jobs globally. What is driving the growth of renewable energy?', 'C. Lower costs and climate concerns', ['A. Government mandates only', 'B. Fossil fuel shortages', 'C. Lower costs and climate concerns', 'D. Public protests']],
    ['In Japan, the tea ceremony is an important cultural tradition. It emphasizes harmony, respect, purity, and tranquility. The ceremony can last several hours and requires years of training to master. What value is NOT mentioned as part of the tea ceremony?', 'D. Wealth', ['A. Harmony', 'B. Respect', 'C. Purity', 'D. Wealth']],
    ['Shakespeare wrote 37 plays during his lifetime, including comedies, tragedies, and histories. His works have been translated into every major language. He is widely considered the greatest writer in the English language. How many plays did Shakespeare write?', 'B. 37', ['A. 27', 'B. 37', 'C. 47', 'D. 57']],
    ['The human brain contains approximately 86 billion neurons. Each neuron can connect to thousands of others. These connections, called synapses, allow us to think, learn, and remember. What enables learning and memory in the brain?', 'D. Connections between neurons called synapses', ['A. The size of the brain', 'B. The number of brain cells only', 'C. Blood flow to the brain', 'D. Connections between neurons called synapses']],
    ['Marie Curie was the first woman to win a Nobel Prize. She discovered the elements polonium and radium. Her work in radioactivity paved the way for modern cancer treatments. What did Marie Curie discover?', 'C. Polonium and radium', ['A. Penicillin', 'B. Electricity', 'C. Polonium and radium', 'D. X-rays']],
    ['The Silk Road was a network of trade routes connecting East and West. It was central to economic, cultural, and political interactions for over 1,500 years. Goods like silk, spices, and precious stones were traded along these routes. What was the main purpose of the Silk Road?', 'B. Trade between East and West', ['A. Military conquest', 'B. Trade between East and West', 'C. Religious pilgrimage', 'D. Migration of people']],
    ['Photosynthesis is the process by which plants convert sunlight into energy. It requires water, carbon dioxide, and sunlight. Oxygen is released as a byproduct. What gas do plants release during photosynthesis?', 'A. Oxygen', ['A. Oxygen', 'B. Carbon dioxide', 'C. Nitrogen', 'D. Hydrogen']]
  ]

  // Hard reading (5)
  const hardReading: [string, string, string[]][] = [
    ['Quantum computing leverages quantum mechanical phenomena such as superposition and entanglement to perform computation. Unlike classical bits that represent either 0 or 1, quantum bits (qubits) can exist in multiple states simultaneously. This capability theoretically allows quantum computers to solve certain problems exponentially faster than classical computers. What gives quantum computers their computational advantage?', 'C. Qubits can exist in multiple states simultaneously', ['A. They use more electricity', 'B. They are physically larger', 'C. Qubits can exist in multiple states simultaneously', 'D. They have more memory']],
    ['The concept of hedonic adaptation suggests that people quickly return to a relatively stable level of happiness despite major positive or negative life events. Studies on lottery winners and accident victims confirm this phenomenon. This has profound implications for how we pursue happiness and well-being. What does hedonic adaptation imply about happiness?', 'A. Major life events do not permanently change our happiness level', ['A. Major life events do not permanently change our happiness level', 'B. Money makes people permanently happier', 'C. Happiness is determined entirely by genetics', 'D. Negative events make people permanently sadder']],
    ['Keynesian economics posits that during recessions, government should increase spending to stimulate demand. This contradicts classical economic theory, which advocates for market self-correction. The debate between these schools of thought continues to influence modern fiscal policy decisions. What does Keynesian economics recommend during recessions?', 'B. Increasing government spending', ['A. Reducing government spending', 'B. Increasing government spending', 'C. Letting the market self-correct', 'D. Raising interest rates']],
    ['The Sapir-Whorf hypothesis proposes that the structure of a language influences its speakers\' worldview and cognitive processes. While the strong version (linguistic determinism) has been largely discredited, the weaker version (linguistic relativity) continues to receive empirical support from studies on color perception and spatial reasoning. What is the current scientific consensus on the Sapir-Whorf hypothesis?', 'D. The weak version has empirical support', ['A. The strong version is widely accepted', 'B. All versions have been completely disproven', 'C. Language has no effect on cognition', 'D. The weak version has empirical support']],
    ['CRISPR-Cas9 is a revolutionary gene-editing technology adapted from a natural bacterial defense mechanism. It allows scientists to make precise modifications to DNA sequences. While offering tremendous potential for treating genetic diseases, it also raises significant ethical concerns about human germline editing and designer babies. What is the source of the CRISPR-Cas9 technology?', 'A. It was adapted from a bacterial defense system', ['A. It was adapted from a bacterial defense system', 'B. It was invented entirely in a laboratory', 'C. It was discovered in plant cells', 'D. It was developed by computer algorithms']]
  ]

  // Listening type questions (easy 10)
  const easyListening: [string, string, string[]][] = [
    ['[Audio] A: "How are you today?" B: "I\'m great, thanks!" What did B say?', 'C. I\'m great', ['A. I\'m tired', 'B. I\'m hungry', 'C. I\'m great', 'D. I\'m busy']],
    ['[Audio] "What time does the meeting start?" "It starts at 3 o\'clock." What time does the meeting start?', 'B. 3:00', ['A. 2:00', 'B. 3:00', 'C. 4:00', 'D. 5:00']],
    ['[Audio] "Could I have a cup of coffee, please?" "Sure, with milk or sugar?" What does the person want?', 'A. Coffee', ['A. Coffee', 'B. Tea', 'C. Water', 'D. Juice']],
    ['[Audio] "Where is the nearest hospital?" "It\'s two blocks down this street." What is being asked for?', 'D. Directions to a hospital', ['A. A restaurant', 'B. A school', 'C. A bank', 'D. Directions to a hospital']],
    ['[Audio] "How much is this shirt?" "It\'s on sale for $25." What is the price?', 'C. $25', ['A. $15', 'B. $20', 'C. $25', 'D. $30']],
    ['[Audio] "Would you like something to eat?" "No, I already had lunch." What does the person mean?', 'B. They are not hungry', ['A. They want more food', 'B. They are not hungry', 'C. They want dinner', 'D. They are cooking']],
    ['[Audio] "The weather forecast says it will rain tomorrow." What is the weather prediction?', 'D. Rain', ['A. Sunshine', 'B. Snow', 'C. Cloudy but dry', 'D. Rain']],
    ['[Audio] "Excuse me, where is the bathroom?" "It\'s on the second floor." Where is the bathroom?', 'A. Second floor', ['A. Second floor', 'B. First floor', 'C. Basement', 'D. Outside']],
    ['[Audio] "I\'m sorry I\'m late. The traffic was terrible." Why is the person late?', 'C. Heavy traffic', ['A. They overslept', 'B. They forgot', 'C. Heavy traffic', 'D. Their car broke down']],
    ['[Audio] "Can I have the check please?" What does the person want?', 'B. The bill/the receipt', ['A. More food', 'B. The bill/the receipt', 'C. A menu', 'D. A reservation']]
  ]

  // Construct all questions
  const allEntries: [string, string, [string, string, string[]][]][] = [
    ['vocabulary', 'easy', easyVocab],
    ['vocabulary', 'medium', medVocab],
    ['vocabulary', 'hard', hardVocab],
    ['grammar', 'easy', easyGrammar],
    ['grammar', 'medium', medGrammar],
    ['grammar', 'hard', hardGrammar],
    ['translation', 'easy', easyTrans],
    ['translation', 'medium', medTrans],
    ['translation', 'hard', hardTrans],
    ['synonym', 'easy', easySyn],
    ['synonym', 'medium', medSyn],
    ['synonym', 'hard', hardSyn],
    ['reading', 'easy', easyReading],
    ['reading', 'medium', medReading],
    ['reading', 'hard', hardReading],
    ['listening', 'easy', easyListening],
  ]

  for (const [type, difficulty, entries] of allEntries) {
    for (const [stem, answerStr, options] of entries) {
      const correctIndex = options.indexOf(answerStr)
      const explanation = `Correct answer: ${answerStr}`
      questions.push({
        type,
        difficulty,
        stem,
        options,
        correct_index: correctIndex >= 0 ? correctIndex : 0,
        explanation,
        time_limit_ms: 15000,
        tags: [difficulty, type],
      })
    }
  }

  return questions
}

export async function questionRoutes(app: FastifyInstance) {
  app.get('/api/questions/seed', async (request, reply) => {
    try {
      const questions = generateQuestions()

      // Insert in batches
      for (const q of questions) {
        await supabaseAdmin.from('questions').upsert(
          {
            type: q.type,
            difficulty: q.difficulty,
            stem: q.stem,
            options: q.options,
            correct_index: q.correct_index,
            explanation: q.explanation,
            time_limit_ms: q.time_limit_ms,
            tags: q.tags,
          },
          { onConflict: 'stem' }
        )
      }

      return { success: true, count: questions.length }
    } catch (err: any) {
      return reply.status(500).send({ error: err.message })
    }
  })
}
