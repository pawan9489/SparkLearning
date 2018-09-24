require 'nokogiri'
require 'FileUtils'

books = 'G:/Compressed/Packt_eBooks/books/**/'

new_folder_to_put = 'G:/Compressed/Packt_eBooks/refined/'
# count = 1
books_count = 0
book_titles = []
folder_with_no_html = []
Dir.glob(books).each_with_index do |folder, ind|
    if ind != 0 # && count >= ind
        folder_name = folder.split('/')[-2]
        index_html = folder + "index.html"
        begin
           page = Nokogiri::HTML(open(index_html)) 
        rescue => exception
            folder_with_no_html << folder_name
            next
        end
        title = page.css('#home > h2').text
        book_titles << title
        # title = title.gsub(' ', '_').split(".").map(&:parameterize).join(".")
        title = title.gsub(' ', '_').gsub(/^.*(\\|\/)/, '').gsub(/[^0-9A-Za-z.\-]/, '_')
        dest_folder = new_folder_to_put + title + '/'
        FileUtils.mkdir_p(dest_folder)
        FileUtils.cp(index_html, dest_folder)
        books_count += 1
    end
end
puts "Total books #{books_count}"
puts "************************************"
book_titles.each {|b| puts b}
puts "************************************"
puts "******* Folders with No HTML *******"
folder_with_no_html.each {|b| puts b}

